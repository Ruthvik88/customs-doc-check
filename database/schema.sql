-- customs-doc-check database schema
-- Postgres (Supabase), region ap-south-1
--
-- Security model:
--   * RLS on every table.
--   * The caller's role is resolved by public.current_app_role(), a SECURITY DEFINER
--     function that reads public.profiles.role (NOT user_metadata, which a user can edit).
--   * API routes use the user-session (authenticated) Supabase client -> RLS applies.
--   * The service-role key is used only by the seed script and the extraction worker,
--     with explicit role checks in code; service role bypasses RLS.
--
-- Status transitions (Approved / Exported) happen through security-definer functions
-- that re-validate gating server-side. Any edit after approval resets status to
-- 'Needs review' and invalidates the approval (trigger).

create extension if not exists pgcrypto;

------------------------------------------------------------
-- profiles (extends Supabase Auth)
------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('documentation_executive','documentation_manager')),
  full_name text,
  email text,
  created_at timestamptz default now()
);

------------------------------------------------------------
-- Resolve the authenticated user's role from profiles.role.
-- Security definer so it can read profiles even though profiles itself is RLS-protected.
-- auth.uid() still refers to the original session user inside this function.
------------------------------------------------------------
create or replace function public.current_app_role()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  r text;
begin
  select p.role into r
  from public.profiles p
  where p.id = auth.uid();
  return coalesce(r, '');
end;
$$;

------------------------------------------------------------
-- suppliers
------------------------------------------------------------
create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text,
  created_at timestamptz default now()
);

------------------------------------------------------------
-- shipments
-- The scalar value columns (currency, incoterm, weights, packages, containers, BL,
-- ports, parties) are RECONCILED values, written only when fields are confirmed.
-- Per-document RAW values live in public.fields / public.line_items.
-- Export reads reconciled values from shipments.*
------------------------------------------------------------
create table public.shipments (
  id uuid primary key default gen_random_uuid(),
  shipment_number text unique not null,
  supplier_id uuid references public.suppliers(id),
  status text not null default 'Draft'
    check (status in ('Draft','Extracting','Needs review','Ready for approval','Approved','Exported')),
  invoice_number text,
  invoice_date date,
  currency text,
  incoterm text,
  gross_weight_kg numeric,
  net_weight_kg numeric,
  total_packages integer,
  containers text[],
  bl_number text,
  vessel text,
  port_of_loading text,
  port_of_discharge text,
  created_by uuid references public.profiles(id),
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  approval_reason text,
  exported_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

------------------------------------------------------------
-- documents (files in private Storage, served via short-lived signed URLs)
------------------------------------------------------------
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  type text not null check (type in ('invoice','packing_list','bill_of_lading')),
  storage_path text not null,
  file_name text not null,
  file_size integer,
  mime_type text,
  status text not null default 'pending'
    check (status in ('pending','extracting','extracted','needs_manual','failed','manual')),
  extraction_attempts integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

------------------------------------------------------------
-- extractions (raw Gemini JSON per document)
------------------------------------------------------------
create table public.extractions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  raw_json jsonb not null,
  model text not null,
  created_at timestamptz default now()
);

------------------------------------------------------------
-- fields (one per extracted field)
--   value   = current value (reconciled on confirmation)
--   ai_value= original AI-extracted value (immutable trace of what the model said)
--   status  = extracted | needs_review | confirmed | edited | manual
------------------------------------------------------------
create table public.fields (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  document_id uuid references public.documents(id),
  key text not null,
  value text,
  ai_value text,
  confidence numeric check (confidence >= 0 and confidence <= 1),
  status text not null default 'extracted'
    check (status in ('extracted','needs_review','confirmed','edited','manual')),
  source_page integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

------------------------------------------------------------
-- line_items
------------------------------------------------------------
create table public.line_items (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  document_id uuid references public.documents(id),
  description text,
  hsn text,
  qty numeric,
  unit_price numeric,
  line_total numeric,
  confidence numeric,
  status text check (status in ('extracted','needs_review','confirmed','edited','manual')),
  source_page integer
);

------------------------------------------------------------
-- crosscheck_results
-- status: pass | fail | cannot_check (missing data != pass)
-- A failed check clears when involved fields are confirmed/edited and the re-run
-- passes, or via override with a mandatory resolution_note.
------------------------------------------------------------
create table public.crosscheck_results (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  check_type text not null,
  status text not null check (status in ('pass','fail','cannot_check')),
  value_a text,
  value_b text,
  delta text,
  fields_involved text[],
  details jsonb,
  resolved_by uuid references public.profiles(id),
  resolved_at timestamptz,
  resolution_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

------------------------------------------------------------
-- field_edits (audit log, insert-only)
-- action: confirm | edit | manual_entry
-- Accuracy per field key & supplier = edited / total reviewed (from this log).
------------------------------------------------------------
create table public.field_edits (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  field_key text not null,
  document_id uuid references public.documents(id),
  old_value text,
  new_value text,
  action text not null check (action in ('confirm','edit','manual_entry')),
  user_id uuid not null references public.profiles(id),
  supplier_id uuid references public.suppliers(id),
  created_at timestamptz default now()
);

------------------------------------------------------------
-- approvals
------------------------------------------------------------
create table public.approvals (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  approver_id uuid not null references public.profiles(id),
  decision text not null check (decision in ('approved','rejected')),
  reason text,
  created_at timestamptz default now()
);

------------------------------------------------------------
-- exports
------------------------------------------------------------
create table public.exports (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  exported_by uuid not null references public.profiles(id),
  file_path text,
  created_at timestamptz default now()
);

------------------------------------------------------------
-- indexes
------------------------------------------------------------
create index idx_shipments_status_number on public.shipments(status, shipment_number);
create index idx_shipments_created_by on public.shipments(created_by);
create index idx_documents_shipment_type on public.documents(shipment_id, type);
create index idx_fields_shipment_key_status on public.fields(shipment_id, key, status);
create index idx_fields_status on public.fields(status);
create index idx_line_items_shipment on public.line_items(shipment_id);
create index idx_crosschecks_shipment on public.crosscheck_results(shipment_id);
create index idx_field_edits_shipment_created on public.field_edits(shipment_id, created_at);
create index idx_approvals_shipment on public.approvals(shipment_id);
create index idx_exports_shipment on public.exports(shipment_id);

------------------------------------------------------------
-- updated_at triggers
------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_shipments_updated_at
  before update on public.shipments for each row
  execute procedure public.set_updated_at();
create trigger trg_documents_updated_at
  before update on public.documents for each row
  execute procedure public.set_updated_at();
create trigger trg_fields_updated_at
  before update on public.fields for each row
  execute procedure public.set_updated_at();
create trigger trg_crosschecks_updated_at
  before update on public.crosscheck_results for each row
  execute procedure public.set_updated_at();

------------------------------------------------------------
-- Status transitions via security-definer functions (manager only).
-- These bypass RLS (run as table owner) but perform explicit role checks inside.
------------------------------------------------------------

create or replace function public.shipment_approve(
  p_shipment_id uuid,
  p_decision text,
  p_reason text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  caller text;
  cur_status text;
begin
  caller := current_app_role();
  if caller <> 'documentation_manager' then
    raise exception 'Only documentation_manager can approve/reject shipments';
  end if;

  select status into cur_status from public.shipments where id = p_shipment_id;
  if cur_status is null then
    raise exception 'Shipment not found';
  end if;
  if cur_status not in ('Ready for approval','Needs review') then
    raise exception 'Shipment is not in an approvable state (current: %)', cur_status;
  end if;

  if p_decision = 'approved' then
    -- gating: no needs_review fields
    perform 1 from public.fields
    where shipment_id = p_shipment_id and status = 'needs_review'
    limit 1;
    if found then
      raise exception 'Cannot approve: shipment has field(s) needing review';
    end if;

    -- gating: no unresolved failed cross-checks
    perform 1 from public.crosscheck_results
    where shipment_id = p_shipment_id and status = 'fail' and resolved_by is null
    limit 1;
    if found then
      raise exception 'Cannot approve: shipment has unresolved failed cross-check(s)';
    end if;
  end if;

  insert into public.approvals (shipment_id, approver_id, decision, reason)
  values (p_shipment_id, auth.uid(), p_decision, p_reason);

  if p_decision = 'approved' then
    update public.shipments
    set status = 'Approved', approved_by = auth.uid(), approved_at = now(), approval_reason = p_reason
    where id = p_shipment_id;
  else
    update public.shipments
    set status = 'Needs review', approved_by = null, approved_at = null, approval_reason = p_reason
    where id = p_shipment_id;
  end if;
end;
$$;

create or replace function public.shipment_export(
  p_shipment_id uuid
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  caller text;
  cur_status text;
  needs_review int;
  failed_unresolved int;
begin
  caller := current_app_role();
  if caller <> 'documentation_manager' then
    raise exception 'Only documentation_manager can export shipments';
  end if;

  select status into cur_status from public.shipments where id = p_shipment_id;
  if cur_status is null then
    raise exception 'Shipment not found';
  end if;
  if cur_status <> 'Approved' then
    raise exception 'Shipment must be Approved before export (current: %)', cur_status;
  end if;

  -- Export re-validation: approved, zero needs_review fields, zero unresolved failed cross-checks
  select count(*) into needs_review
  from public.fields
  where shipment_id = p_shipment_id and status = 'needs_review';
  if needs_review > 0 then
    raise exception 'Cannot export: % field(s) still need review', needs_review;
  end if;

  select count(*) into failed_unresolved
  from public.crosscheck_results
  where shipment_id = p_shipment_id and status = 'fail' and resolved_by is null;
  if failed_unresolved > 0 then
    raise exception 'Cannot export: % unresolved failed cross-check(s)', failed_unresolved;
  end if;

  insert into public.exports (shipment_id, exported_by)
  values (p_shipment_id, auth.uid());

  update public.shipments
  set status = 'Exported', exported_at = now()
  where id = p_shipment_id;
end;
$$;

------------------------------------------------------------
-- Trigger: any field/line-item status change after approval resets the shipment
-- to 'Needs review' and invalidates the approval.
------------------------------------------------------------
create or replace function public.reset_approval_on_edit()
returns trigger
language plpgsql
as $$
declare
  cur_status text;
begin
  select status into cur_status from public.shipments where id = NEW.shipment_id;
  if cur_status = 'Approved' then
    update public.shipments
    set status = 'Needs review', approved_by = null, approved_at = null, approval_reason = null
    where id = NEW.shipment_id;
  end if;
  return NEW;
end;
$$;

create trigger trg_fields_reset_approval
  after update on public.fields
  for each row
  when (OLD.status is distinct from NEW.status)
  execute procedure public.reset_approval_on_edit();

create trigger trg_line_items_reset_approval
  after update on public.line_items
  for each row
  when (OLD.status is distinct from NEW.status)
  execute procedure public.reset_approval_on_edit();

------------------------------------------------------------
-- RLS
------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.suppliers enable row level security;
alter table public.shipments enable row level security;
alter table public.documents enable row level security;
alter table public.extractions enable row level security;
alter table public.fields enable row level security;
alter table public.line_items enable row level security;
alter table public.crosscheck_results enable row level security;
alter table public.field_edits enable row level security;
alter table public.approvals enable row level security;
alter table public.exports enable row level security;

-- profiles: authenticated users read only their own row
create policy profiles_own on public.profiles
  for select to authenticated
  using (auth.uid() = id);

-- suppliers: read by all authenticated
create policy suppliers_read on public.suppliers
  for select to authenticated
  using (true);

-- shipments
create policy shipments_read on public.shipments
  for select to authenticated
  using (true);
create policy shipments_insert_exec on public.shipments
  for insert to authenticated
  with check (current_app_role() = 'documentation_executive');
create policy shipments_update_exec on public.shipments
  for update to authenticated
  using (current_app_role() = 'documentation_executive')
  with check (current_app_role() = 'documentation_executive');

-- documents
create policy documents_read on public.documents
  for select to authenticated
  using (true);
create policy documents_insert_exec on public.documents
  for insert to authenticated
  with check (current_app_role() = 'documentation_executive');

-- extractions
create policy extractions_read on public.extractions
  for select to authenticated
  using (true);

-- fields
create policy fields_read on public.fields
  for select to authenticated
  using (true);
create policy fields_insert_exec on public.fields
  for insert to authenticated
  with check (current_app_role() = 'documentation_executive');
create policy fields_update_exec on public.fields
  for update to authenticated
  using (current_app_role() = 'documentation_executive')
  with check (current_app_role() = 'documentation_executive');

-- line_items
create policy line_items_read on public.line_items
  for select to authenticated
  using (true);
create policy line_items_insert_exec on public.line_items
  for insert to authenticated
  with check (current_app_role() = 'documentation_executive');
create policy line_items_update_exec on public.line_items
  for update to authenticated
  using (current_app_role() = 'documentation_executive')
  with check (current_app_role() = 'documentation_executive');

-- crosscheck_results
create policy crosschecks_read on public.crosscheck_results
  for select to authenticated
  using (true);

-- field_edits: read all; insert executive only; no update/delete policy -> insert-only
create policy field_edits_read on public.field_edits
  for select to authenticated
  using (true);
create policy field_edits_insert_exec on public.field_edits
  for insert to authenticated
  with check (current_app_role() = 'documentation_executive');

-- approvals
create policy approvals_read on public.approvals
  for select to authenticated
  using (true);
create policy approvals_insert_manager on public.approvals
  for insert to authenticated
  with check (current_app_role() = 'documentation_manager');

-- exports
create policy exports_read on public.exports
  for select to authenticated
  using (true);
create policy exports_insert_manager on public.exports
  for insert to authenticated
  with check (current_app_role() = 'documentation_manager');

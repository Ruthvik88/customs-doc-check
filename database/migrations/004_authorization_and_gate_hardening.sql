-- Phase 1.2. Depends on 002 and 003. This migration does not rewrite shipment owners.
begin;

do $$
begin
  if to_regclass('public.shipments') is null or to_regclass('public.profiles') is null
    or to_regclass('public.crosscheck_results') is null then
    raise exception 'Apply database/schema.sql before migration 004';
  end if;
  if to_regprocedure('public.current_app_role()') is null
    or to_regprocedure('public.lock_shipment_for_source_change()') is null then
    raise exception 'Apply migrations 002 and 003 before migration 004';
  end if;
  if not exists (select 1 from pg_constraint
      where conrelid='public.crosscheck_results'::regclass
        and conname='crosscheck_results_shipment_check_type_key' and contype='u') then
    raise exception 'Migration 003 unique cross-check constraint is missing';
  end if;
  if to_regclass('public.shipment_ownership_transfers') is not null then
    raise exception 'shipment_ownership_transfers already exists; inspect it before applying migration 004';
  end if;
end $$;

-- RLS prevents executive ownership changes; the invoker trigger also blocks
-- direct PostgREST writes made with authenticated or service_role credentials.
create table public.shipment_ownership_transfers (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id),
  previous_owner uuid references public.profiles(id),
  new_owner uuid not null references public.profiles(id),
  transferred_by uuid not null references public.profiles(id),
  reason text not null check (length(btrim(reason)) > 0),
  created_at timestamptz not null default now()
);
alter table public.shipment_ownership_transfers enable row level security;
revoke all on table public.shipment_ownership_transfers from public, anon, authenticated, service_role;
grant select on table public.shipment_ownership_transfers to authenticated;
create policy ownership_transfers_read_manager on public.shipment_ownership_transfers
  for select to authenticated using (public.current_app_role() = 'documentation_manager');

create or replace function public.guard_shipment_owner_change()
returns trigger language plpgsql
set search_path = pg_catalog, public
as $$
begin
  if current_user in ('postgres', 'supabase_admin') then
    return new;
  end if;
  if tg_op = 'INSERT' then
    if new.created_by is null or new.created_by is distinct from auth.uid() then
      raise exception 'A shipment must be created for the authenticated owner';
    end if;
  elsif new.created_by is distinct from old.created_by then
    raise exception 'Shipment ownership changes require the authorized transfer function';
  end if;
  return new;
end;
$$;
create trigger trg_guard_shipment_owner_change
  before insert or update of created_by on public.shipments
  for each row execute function public.guard_shipment_owner_change();
revoke all on function public.guard_shipment_owner_change() from public, anon, authenticated, service_role;

drop policy if exists shipments_update_exec on public.shipments;
create policy shipments_update_exec on public.shipments for update to authenticated
  using (public.current_app_role() = 'documentation_executive' and created_by = auth.uid())
  with check (public.current_app_role() = 'documentation_executive'
    and status not in ('Approved','Exported')
    and created_by = auth.uid());
drop policy if exists shipments_insert_exec on public.shipments;
create policy shipments_insert_exec on public.shipments for insert to authenticated
  with check (public.current_app_role() = 'documentation_executive' and created_by = auth.uid());

create or replace function public.transfer_shipment_ownership(
  p_shipment_id uuid, p_new_owner uuid, p_reason text
) returns void language plpgsql security definer
set search_path = pg_catalog, public, auth
as $$
declare v_previous uuid;
begin
  if public.current_app_role() <> 'documentation_manager' then
    raise exception 'Only documentation_manager can transfer shipment ownership';
  end if;
  if nullif(btrim(p_reason), '') is null then raise exception 'Ownership transfer reason is required'; end if;
  perform 1 from public.profiles where id = p_new_owner and role = 'documentation_executive';
  if not found then raise exception 'New owner must be a documentation_executive'; end if;
  select created_by into v_previous from public.shipments where id = p_shipment_id for update;
  if not found then raise exception 'Shipment not found'; end if;
  insert into public.shipment_ownership_transfers(shipment_id, previous_owner, new_owner, transferred_by, reason)
    values (p_shipment_id, v_previous, p_new_owner, auth.uid(), btrim(p_reason));
  update public.shipments set created_by = p_new_owner where id = p_shipment_id;
end;
$$;
revoke all on function public.transfer_shipment_ownership(uuid, uuid, text) from public, anon, service_role;
grant execute on function public.transfer_shipment_ownership(uuid, uuid, text) to authenticated;

-- One shared gate ensures exact cardinality and membership, not merely absence
-- of currently failing rows.
-- Read-only deployment preflight for existing shipments that could otherwise
-- be awaiting approval/export:
-- with expected(check_types) as (select array[
--   'container_numbers','currency_incoterm','gross_weight','invoice_total',
--   'line_item_math','line_item_qty','supplier_consistency','total_packages']::text[])
-- select s.id, s.shipment_number, s.status, count(c.id) as check_count,
--        array_agg(c.check_type order by c.check_type collate "C") as check_types
-- from public.shipments s left join public.crosscheck_results c on c.shipment_id=s.id
-- where s.status in ('Ready for approval','Approved')
-- group by s.id, s.shipment_number, s.status
-- having count(c.id) <> 8 or array_agg(c.check_type order by c.check_type collate "C")
--   is distinct from (select check_types from expected);
create or replace function public.assert_crosschecks_complete(p_shipment_id uuid)
returns void language plpgsql security definer
set search_path = pg_catalog, public
as $$
declare v_count integer; v_types text[];
begin
  select count(*), array_agg(check_type order by check_type collate "C")
    into v_count, v_types from public.crosscheck_results where shipment_id = p_shipment_id;
  if v_count <> 8 or v_types is distinct from array[
    'container_numbers','currency_incoterm','gross_weight','invoice_total',
    'line_item_math','line_item_qty','supplier_consistency','total_packages'
  ]::text[] then raise exception 'Cannot progress: shipment must have exactly the complete set of eight cross-checks'; end if;
  if exists (select 1 from public.crosscheck_results c where c.shipment_id = p_shipment_id
      and (c.status = 'cannot_check' or (c.status = 'fail' and
        (c.resolved_by is null or c.resolved_at is null or nullif(btrim(c.resolution_note),'') is null))))
  then raise exception 'Cannot progress: shipment has unresolved cross-checks'; end if;
end;
$$;
revoke all on function public.assert_crosschecks_complete(uuid) from public, anon, authenticated, service_role;

-- Replace the Phase 1.1 lock trigger so a source mutation takes only the
-- established shipment-first lock, invalidates checks, and clears approval.
-- Exported rows are rejected; export history remains append-only.
create or replace function public.lock_shipment_for_source_change()
returns trigger language plpgsql security definer
set search_path = pg_catalog, public
as $$
declare v_shipment_id uuid; v_status text;
begin
  if tg_op = 'UPDATE' and old.shipment_id is distinct from new.shipment_id then
    raise exception 'Moving source rows between shipments is not supported';
  end if;
  v_shipment_id := coalesce(new.shipment_id, old.shipment_id);
  select status into v_status from public.shipments where id = v_shipment_id for update;
  if not found then if tg_op = 'DELETE' then return old; end if; raise exception 'Shipment not found'; end if;
  if v_status = 'Exported' then raise exception 'Source changes are not allowed after export'; end if;
  if v_status = 'Approved' then
    update public.shipments set status = 'Needs review', approved_by = null, approved_at = null,
      approval_reason = null where id = v_shipment_id;
  end if;
  update public.crosscheck_results c set status = 'cannot_check',
    details = coalesce(c.details, '{}'::jsonb) || jsonb_build_object('source_change_history',
      coalesce(c.details->'source_change_history','[]'::jsonb) || jsonb_build_array(jsonb_build_object(
        'recorded_at', now(), 'status', c.status, 'value_a', c.value_a, 'value_b', c.value_b,
        'delta', c.delta, 'fields_involved', c.fields_involved, 'details', coalesce(c.details,'{}'::jsonb))))
      || case when c.resolved_by is not null or c.resolved_at is not null or c.resolution_note is not null
        then jsonb_build_object('resolution_history', coalesce(c.details->'resolution_history','[]'::jsonb)
          || jsonb_build_array(jsonb_build_object('status',c.status,'resolved_by',c.resolved_by,
            'resolved_at',c.resolved_at,'resolution_note',c.resolution_note))) else '{}'::jsonb end,
    resolved_by = null, resolved_at = null, resolution_note = null, updated_at = now()
    where c.shipment_id = v_shipment_id and (c.status <> 'cannot_check' or c.resolved_by is not null
      or c.resolved_at is not null or c.resolution_note is not null);
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

-- Approval gate: shipment row lock is held before validating complete checks.
create or replace function public.shipment_approve(p_shipment_id uuid, p_decision text, p_reason text)
returns void language plpgsql security definer set search_path = pg_catalog, public, auth as $$
declare cur_status text;
begin
  if public.current_app_role() <> 'documentation_manager' then raise exception 'Only documentation_manager can approve/reject shipments'; end if;
  select status into cur_status from public.shipments where id=p_shipment_id for update;
  if cur_status is null then raise exception 'Shipment not found'; end if;
  if cur_status not in ('Ready for approval','Needs review') then raise exception 'Shipment is not in an approvable state'; end if;
  if p_decision = 'approved' then
    if exists(select 1 from public.fields where shipment_id=p_shipment_id and status='needs_review') then raise exception 'Cannot approve: fields need review'; end if;
    perform public.assert_crosschecks_complete(p_shipment_id);
  elsif p_decision <> 'rejected' then raise exception 'Invalid approval decision'; end if;
  insert into public.approvals(shipment_id,approver_id,decision,reason) values(p_shipment_id,auth.uid(),p_decision,p_reason);
  if p_decision='approved' then update public.shipments set status='Approved',approved_by=auth.uid(),approved_at=now(),approval_reason=p_reason where id=p_shipment_id;
  else update public.shipments set status='Needs review',approved_by=null,approved_at=null,approval_reason=p_reason where id=p_shipment_id; end if;
end; $$;

create or replace function public.shipment_export(p_shipment_id uuid)
returns void language plpgsql security definer set search_path = pg_catalog, public, auth as $$
declare cur_status text;
begin
  if public.current_app_role() <> 'documentation_manager' then raise exception 'Only documentation_manager can export shipments'; end if;
  select status into cur_status from public.shipments where id=p_shipment_id for update;
  if cur_status is null then raise exception 'Shipment not found'; end if;
  if cur_status <> 'Approved' then raise exception 'Shipment must be Approved before export'; end if;
  if exists(select 1 from public.fields where shipment_id=p_shipment_id and status='needs_review') then raise exception 'Cannot export: fields need review'; end if;
  perform public.assert_crosschecks_complete(p_shipment_id);
  insert into public.exports(shipment_id,exported_by) values(p_shipment_id,auth.uid());
  update public.shipments set status='Exported',exported_at=now() where id=p_shipment_id;
end; $$;

create or replace function public.shipment_export_snapshot(p_shipment_id uuid)
returns jsonb language plpgsql security definer set search_path = pg_catalog, public, auth as $$
declare s public.shipments%rowtype; supplier_name text; field_values jsonb;
begin
  if public.current_app_role() <> 'documentation_manager' then raise exception 'Only documentation_manager can export shipments'; end if;
  select * into s from public.shipments where id=p_shipment_id for update;
  if not found then raise exception 'Shipment not found'; end if;
  if s.status <> 'Approved' then raise exception 'Shipment must be Approved before export'; end if;
  if exists(select 1 from public.fields where shipment_id=p_shipment_id and status='needs_review') then raise exception 'Cannot export: fields need review'; end if;
  perform public.assert_crosschecks_complete(p_shipment_id);
  select name into supplier_name from public.suppliers where id=s.supplier_id;
  select coalesce(jsonb_object_agg(key,value order by id),'{}'::jsonb) into field_values
    from public.fields where shipment_id=p_shipment_id and key in ('consignee','invoice_total');
  insert into public.exports(shipment_id,exported_by,file_path) values(p_shipment_id,auth.uid(),'export_'||s.shipment_number||'.csv');
  update public.shipments set status='Exported',exported_at=now() where id=p_shipment_id;
  return jsonb_build_object('shipment',to_jsonb(s)||jsonb_build_object('suppliers',jsonb_build_object('name',supplier_name)),'fields',field_values);
end; $$;

revoke all on function public.shipment_approve(uuid,text,text) from public,anon;
revoke all on function public.shipment_export(uuid) from public,anon;
revoke all on function public.shipment_export_snapshot(uuid) from public,anon;
revoke all on function public.guard_shipment_owner_change() from public, anon, authenticated, service_role;
revoke all on function public.lock_shipment_for_source_change() from public, anon, authenticated, service_role;
grant execute on function public.shipment_approve(uuid,text,text) to authenticated;
grant execute on function public.shipment_export(uuid) to authenticated;
grant execute on function public.shipment_export_snapshot(uuid) to authenticated;
commit;

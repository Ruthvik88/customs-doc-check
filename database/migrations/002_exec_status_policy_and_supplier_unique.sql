-- database/migrations/002_exec_status_policy_and_supplier_unique.sql
--
-- Idempotent migration for databases that already have the older schema
-- applied. Do NOT re-run database/schema.sql on an existing database; run
-- this file instead. It applies only the two fixes from the tests rewrite:
--
--   1. shipments_update_exec RLS policy: executives may update shipments but
--      may not move status to 'Approved' or 'Exported' (those transitions are
--      manager-only via shipment_approve / shipment_export).
--   2. suppliers.name unique constraint.
--
-- Safe to run multiple times. Each change is guarded so a second run is a
-- no-op. Paste into the Supabase SQL Editor and click Run.

-----------------------------------------------------------
-- 1. Executive update policy: block Approved / Exported transitions
-----------------------------------------------------------
drop policy if exists shipments_update_exec on public.shipments;

create policy shipments_update_exec on public.shipments
  for update to authenticated
  using (current_app_role() = 'documentation_executive')
  with check (current_app_role() = 'documentation_executive'
    and status not in ('Approved', 'Exported'));

-----------------------------------------------------------
-- 2. suppliers.name unique constraint (add only if missing)
-----------------------------------------------------------
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.suppliers'::regclass
      and contype = 'u'
      and conname = 'suppliers_name_key'
  ) then
    alter table public.suppliers
      add constraint suppliers_name_key unique (name);
  end if;
end $$;

-- database/tests.sql
--
-- Server-side security tests for the customs-doc-check schema (Supabase /
-- Postgres). Paste the entire file into the Supabase SQL Editor and click Run.
-- No psql meta-commands (\set, \echo, ...) are used; every test prints a
-- clear line:
--   PASS: <test name> [<detail>]
--   FAIL: <test name> [<detail>]
--
-- Prerequisites (apply before running this file):
--   * database/schema.sql and migrations/002, 003, and 004 applied to the test database.
--   * Demo Auth users exist (created by scripts/seed.py --load or manually):
--       exec@demo.local    -> public.profiles.role = documentation_executive
--       manager@demo.local -> public.profiles.role = documentation_manager
--   The test looks up the real user UUIDs from auth.users by email; no
--   hard-coded ids are used anywhere.
--
-- Every test impersonates a demo user the Supabase way:
--   set local role authenticated;
--   select set_config('request.jwt.claims', json_build_object('sub', <uuid>,
--     'role', 'authenticated')::text, true);
-- and resets role + claims between tests.
--
-- Fixture rows (a supplier, executive-owned shipments, fields, a field_edit)
-- are created inside one transaction and rolled back at the end, so nothing
-- is left behind.

raise notice '== database/tests.sql: security tests ==';

begin; -- everything below runs in one transaction, rolled back at the very end

-- ---------------------------------------------------------------------------
-- 0. Resolve the real demo users from auth.users (no hard-coded ids).
-- ---------------------------------------------------------------------------
create temp table demo_users (
  app_role text primary key,
  id uuid not null,
  email text not null
);

insert into demo_users (app_role, id, email)
select 'documentation_executive', id, email
from auth.users where email = 'exec@demo.local'
union all
select 'documentation_manager', id, email
from auth.users where email = 'manager@demo.local';

-- Make sure profiles exist for both users with the correct role.
insert into public.profiles (id, role, full_name, email)
select id, app_role, email, email
from demo_users
on conflict (id) do update set role = excluded.role;

grant select on demo_users to authenticated, anon, service_role;

do $$
declare
  v_users int;
begin
  select count(*) into v_users from demo_users;
  if v_users = 2 then
    raise notice 'PASS: setup — demo users resolved from auth.users (exec@demo.local, manager@demo.local)';
  else
    raise exception 'FAIL: setup — expected 2 demo users in auth.users, found % (need exec@demo.local and manager@demo.local)', v_users;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Fixture rows (created as the session owner, before any role switch):
--   supplier  : one supplier
--   ship_exec : Draft shipment owned by the executive
--   ship_ok   : Ready for approval, no flags (positive-control fixture)
--   ship_needs: Ready for approval, one field in needs_review
--   ship_fail : Ready for approval, one unresolved failed cross-check
--   edit_id   : existing field_edit row (insert-only audit log)
-- ---------------------------------------------------------------------------
create temp table fx (
  supplier_id uuid,
  ship_exec uuid,
  ship_ok uuid,
  ship_needs uuid,
  ship_fail uuid,
  ship_cannot_approve uuid,
  ship_cannot_export uuid,
  ship_incomplete_approve uuid,
  ship_incomplete_export uuid,
  ship_other_owner uuid,
  ship_source_approved uuid,
  doc_exec uuid,
  doc_ok uuid,
  doc_needs uuid,
  doc_fail uuid,
  edit_id uuid
);
insert into fx default values;

grant select on fx to authenticated, anon, service_role;

insert into public.suppliers (name, country)
values ('Demo Supplier', 'CN')
on conflict (name) do nothing;

insert into public.shipments (shipment_number, supplier_id, status, created_by)
select 'SHP-EXEC-001', s.id, 'Draft', d.id
from public.suppliers s, demo_users d
where s.name = 'Demo Supplier' and d.app_role = 'documentation_executive';

insert into public.shipments (shipment_number, supplier_id, status, created_by)
select 'SHP-OK-001', s.id, 'Ready for approval', d.id
from public.suppliers s, demo_users d
where s.name = 'Demo Supplier' and d.app_role = 'documentation_executive';

insert into public.shipments (shipment_number, supplier_id, status, created_by)
select 'SHP-NEEDS-001', s.id, 'Ready for approval', d.id
from public.suppliers s, demo_users d
where s.name = 'Demo Supplier' and d.app_role = 'documentation_executive';

insert into public.shipments (shipment_number, supplier_id, status, created_by)
select 'SHP-FAIL-001', s.id, 'Ready for approval', d.id
from public.suppliers s, demo_users d
where s.name = 'Demo Supplier' and d.app_role = 'documentation_executive';

insert into public.shipments (shipment_number, supplier_id, status, created_by)
select 'SHP-CANNOT-APPROVE-001', s.id, 'Ready for approval', d.id
from public.suppliers s, demo_users d
where s.name = 'Demo Supplier' and d.app_role = 'documentation_executive';

insert into public.shipments (shipment_number, supplier_id, status, created_by)
select 'SHP-CANNOT-EXPORT-001', s.id, 'Approved', d.id
from public.suppliers s, demo_users d
where s.name = 'Demo Supplier' and d.app_role = 'documentation_executive';

insert into public.shipments (shipment_number, supplier_id, status, created_by)
select 'SHP-INCOMPLETE-APPROVE-001', s.id, 'Ready for approval', d.id
from public.suppliers s, demo_users d
where s.name = 'Demo Supplier' and d.app_role = 'documentation_executive';

insert into public.shipments (shipment_number, supplier_id, status, created_by)
select 'SHP-INCOMPLETE-EXPORT-001', s.id, 'Approved', d.id
from public.suppliers s, demo_users d
where s.name = 'Demo Supplier' and d.app_role = 'documentation_executive';

insert into public.shipments (shipment_number, supplier_id, status, created_by)
select 'SHP-OTHER-OWNER-001', s.id, 'Draft', d.id
from public.suppliers s, demo_users d
where s.name = 'Demo Supplier' and d.app_role = 'documentation_manager';

insert into public.shipments (shipment_number, supplier_id, status, created_by, approved_by, approved_at, approval_reason)
select 'SHP-SOURCE-APPROVED-001', s.id, 'Approved', e.id, m.id, now(), 'approval metadata fixture'
from public.suppliers s
cross join demo_users e
cross join demo_users m
where s.name = 'Demo Supplier' and e.app_role = 'documentation_executive'
  and m.app_role = 'documentation_manager';

update fx set
  supplier_id = (select id from public.suppliers where name = 'Demo Supplier'),
  ship_exec   = (select id from public.shipments where shipment_number = 'SHP-EXEC-001'),
  ship_ok     = (select id from public.shipments where shipment_number = 'SHP-OK-001'),
  ship_needs  = (select id from public.shipments where shipment_number = 'SHP-NEEDS-001'),
  ship_fail   = (select id from public.shipments where shipment_number = 'SHP-FAIL-001');
update fx set
  ship_cannot_approve = (select id from public.shipments where shipment_number = 'SHP-CANNOT-APPROVE-001'),
  ship_cannot_export = (select id from public.shipments where shipment_number = 'SHP-CANNOT-EXPORT-001'),
  ship_incomplete_approve = (select id from public.shipments where shipment_number = 'SHP-INCOMPLETE-APPROVE-001'),
  ship_incomplete_export = (select id from public.shipments where shipment_number = 'SHP-INCOMPLETE-EXPORT-001'),
  ship_other_owner = (select id from public.shipments where shipment_number = 'SHP-OTHER-OWNER-001');
update fx set ship_source_approved = (select id from public.shipments where shipment_number = 'SHP-SOURCE-APPROVED-001');

insert into public.documents (shipment_id, type, storage_path, file_name)
select ship_exec, 'invoice', 'tests/SHP-EXEC-001/invoice.pdf', 'invoice.pdf' from fx;
insert into public.documents (shipment_id, type, storage_path, file_name)
select ship_ok, 'invoice', 'tests/SHP-OK-001/invoice.pdf', 'invoice.pdf' from fx;
insert into public.documents (shipment_id, type, storage_path, file_name)
select ship_needs, 'invoice', 'tests/SHP-NEEDS-001/invoice.pdf', 'invoice.pdf' from fx;
insert into public.documents (shipment_id, type, storage_path, file_name)
select ship_fail, 'invoice', 'tests/SHP-FAIL-001/invoice.pdf', 'invoice.pdf' from fx;
insert into public.documents (shipment_id, type, storage_path, file_name)
select ship_source_approved, 'invoice', 'tests/SHP-SOURCE-APPROVED-001/invoice.pdf', 'invoice.pdf' from fx;

update fx set
  doc_exec  = (select id from public.documents where shipment_id = (select ship_exec from fx) limit 1),
  doc_ok    = (select id from public.documents where shipment_id = (select ship_ok from fx) limit 1),
  doc_needs = (select id from public.documents where shipment_id = (select ship_needs from fx) limit 1),
  doc_fail  = (select id from public.documents where shipment_id = (select ship_fail from fx) limit 1);

-- ship_ok: all fields confirmed, no cross-check flags -> approvable.
insert into public.fields (shipment_id, document_id, key, value, status)
select ship_ok, doc_ok, 'gross_weight_kg', '1000', 'confirmed' from fx;
-- ship_needs: one field still needs review -> approval must be refused.
insert into public.fields (shipment_id, document_id, key, value, status)
select ship_needs, doc_needs, 'gross_weight_kg', '1000', 'needs_review' from fx;
-- ship_fail: fields confirmed, but an unresolved failed cross-check exists.
insert into public.fields (shipment_id, document_id, key, value, status)
select ship_fail, doc_fail, 'gross_weight_kg', '1000', 'confirmed' from fx;
insert into public.fields (shipment_id, document_id, key, value, status)
select ship_source_approved,
  (select id from public.documents where shipment_id = ship_source_approved limit 1),
  'gross_weight_kg', '1000', 'confirmed' from fx;
insert into public.crosscheck_results (shipment_id, check_type, status, value_a, value_b, resolved_by, resolved_at, resolution_note)
select ship_source_approved, 'gross_weight', 'fail', '1000', '1001',
  (select id from demo_users where app_role = 'documentation_manager'), now(), 'source approval test resolution'
from fx;
-- Every approval/export fixture starts with the exact expected eight checks.
-- Individual negative cases change one row's status or delete one check below.
insert into public.crosscheck_results (shipment_id, check_type, status, value_a, value_b, fields_involved, resolved_by, resolved_at, resolution_note)
select f.shipment_id, checks.check_type,
  case
    when f.shipment_id = (select ship_fail from fx) and checks.check_type = 'gross_weight' then 'fail'
    when f.shipment_id in ((select ship_cannot_approve from fx),(select ship_cannot_export from fx)) and checks.check_type = 'gross_weight' then 'cannot_check'
    else 'pass'
  end,
  case when f.shipment_id = (select ship_fail from fx) and checks.check_type = 'gross_weight' then '1000' end,
  case when f.shipment_id = (select ship_fail from fx) and checks.check_type = 'gross_weight' then '1001' end,
  case when checks.check_type = 'gross_weight' then array['gross_weight_kg'] else '{}'::text[] end,
  case when f.shipment_id = (select ship_cannot_export from fx) and checks.check_type = 'gross_weight'
       then (select id from demo_users where app_role = 'documentation_manager') end,
  case when f.shipment_id = (select ship_cannot_export from fx) and checks.check_type = 'gross_weight' then now() end,
  case when f.shipment_id = (select ship_cannot_export from fx) and checks.check_type = 'gross_weight'
       then 'recorded but cannot override missing evidence' end
from (select unnest(array[(select ship_ok from fx),(select ship_fail from fx),
                          (select ship_cannot_approve from fx),(select ship_cannot_export from fx),
                          (select ship_incomplete_approve from fx),(select ship_incomplete_export from fx)]) shipment_id) f
cross join unnest(array['container_numbers','currency_incoterm','gross_weight','invoice_total',
                        'line_item_math','line_item_qty','supplier_consistency','total_packages']) checks(check_type);

delete from public.crosscheck_results where shipment_id = (select ship_incomplete_approve from fx) and check_type = 'total_packages';
delete from public.crosscheck_results where shipment_id = (select ship_incomplete_export from fx) and check_type = 'total_packages';

do $$
declare v_ship uuid; v_rejected boolean := false;
begin
  select ship_ok into v_ship from fx;
  begin
    insert into public.crosscheck_results(shipment_id,check_type,status)
      values(v_ship,'gross_weight','pass');
  exception when unique_violation then v_rejected := true;
  end;
  if not v_rejected then raise exception 'Duplicate shipment/check_type pair was accepted'; end if;
end $$;

-- Existing field_edit row for the update/delete tests (insert-only audit log).
insert into public.field_edits (shipment_id, field_key, document_id, old_value, new_value, action, user_id, supplier_id)
select ship_exec, 'gross_weight_kg', doc_exec, '990', '1000', 'edit', d.id, supplier_id
from fx, demo_users d
where d.app_role = 'documentation_executive';
update fx set edit_id = (
  select id from public.field_edits
  where shipment_id = (select ship_exec from fx)
  order by created_at desc limit 1
);

-- ---------------------------------------------------------------------------
-- Cross-check RPC transaction regression checks (requires migration 003).
-- These run as the database owner against an executive-owned fixture.
-- ---------------------------------------------------------------------------
do $$
declare
  v_ship uuid;
  v_actor uuid;
  v_snapshot jsonb;
  v_results jsonb;
  v_reordered jsonb;
  v_wrong_snapshot jsonb;
  v_changed jsonb;
  v_invalid jsonb;
  v_count int;
  v_failed boolean := false;
  v_row public.crosscheck_results%rowtype;
begin
  select ship_exec into v_ship from fx;
  select id into v_actor from demo_users where app_role = 'documentation_executive';
  select jsonb_build_object(
    'documents', coalesce((select jsonb_agg(to_jsonb(d) order by d.id) from public.documents d where d.shipment_id = v_ship), '[]'::jsonb),
    'fields', coalesce((select jsonb_agg(to_jsonb(f) order by f.id) from public.fields f where f.shipment_id = v_ship), '[]'::jsonb),
    'line_items', coalesce((select jsonb_agg(to_jsonb(li) order by li.id) from public.line_items li where li.shipment_id = v_ship), '[]'::jsonb)
  ) into v_snapshot;
  v_results := jsonb_build_array(
    jsonb_build_object('check_type','invoice_total','status','pass','fields_involved','[]'::jsonb,'details','{}'::jsonb),
    jsonb_build_object('check_type','line_item_math','status','pass','fields_involved','[]'::jsonb,'details','{}'::jsonb),
    jsonb_build_object('check_type','line_item_qty','status','pass','fields_involved','[]'::jsonb,'details','{}'::jsonb),
    jsonb_build_object('check_type','total_packages','status','pass','fields_involved','[]'::jsonb,'details','{}'::jsonb),
    jsonb_build_object('check_type','gross_weight','status','pass','value_a','1000','fields_involved','[]'::jsonb,'details','{"before":{"a":1,"b":2}}'::jsonb),
    jsonb_build_object('check_type','container_numbers','status','pass','fields_involved','[]'::jsonb,'details','{}'::jsonb),
    jsonb_build_object('check_type','currency_incoterm','status','pass','fields_involved','[]'::jsonb,'details','{}'::jsonb),
    jsonb_build_object('check_type','supplier_consistency','status','pass','fields_involved','[]'::jsonb,'details','{}'::jsonb)
  );

  v_wrong_snapshot := v_snapshot || jsonb_build_object('documents', '[]'::jsonb);
  begin
    perform public.persist_crosscheck_results(v_ship, v_actor, v_wrong_snapshot, v_results);
  exception when others then
    if sqlerrm = 'Shipment source data changed during recomputation' then v_failed := true; end if;
  end;
  select count(*) into v_count from public.crosscheck_results where shipment_id = v_ship;
  if v_failed and v_count = 0 then raise notice 'PASS: changed source snapshot is rejected before persistence';
  else raise notice 'FAIL: stale source snapshot was accepted or wrote % results', v_count; end if;
  v_failed := false;

  begin
    perform public.persist_crosscheck_results(v_ship, v_actor, v_snapshot,
      jsonb_set(v_results, '{7,status}', '"invalid"'::jsonb));
  exception when check_violation then v_failed := true;
  end;
  select count(*) into v_count from public.crosscheck_results where shipment_id = v_ship;
  if v_failed and v_count = 0 then raise notice 'PASS: cross-check persistence failure rolls back every result';
  else raise notice 'FAIL: cross-check persistence failure left % result(s)', v_count; end if;

  perform public.persist_crosscheck_results(v_ship, v_actor, v_snapshot, v_results);
  perform public.persist_crosscheck_results(v_ship, v_actor, v_snapshot, v_results);
  select count(*) into v_count from public.crosscheck_results where shipment_id = v_ship;
  if v_count = 8 then raise notice 'PASS: repeated recomputation is idempotent';
  else raise notice 'FAIL: repeated recomputation produced % result rows', v_count; end if;

  update public.crosscheck_results set resolved_by = (select id from demo_users where app_role = 'documentation_manager'),
    resolved_at = now(), resolution_note = 'preserve this audit note'
    where shipment_id = v_ship and check_type = 'gross_weight';
  v_reordered := jsonb_set(v_results, '{4,details}', '{"before":{"b":2,"a":1}}'::jsonb);
  perform public.persist_crosscheck_results(v_ship, v_actor, v_snapshot, v_reordered);
  select * into v_row from public.crosscheck_results where shipment_id = v_ship and check_type = 'gross_weight';
  if v_row.resolved_by is not null and v_row.resolution_note = 'preserve this audit note' then
    raise notice 'PASS: reordered JSON object keys retain the resolution';
  else raise notice 'FAIL: reordered JSON object keys invalidated the resolution'; end if;

  v_changed := jsonb_set(v_results, '{4,value_a}', '"1001"'::jsonb);
  perform public.persist_crosscheck_results(v_ship, v_actor, v_snapshot, v_changed);
  select * into v_row from public.crosscheck_results where shipment_id = v_ship and check_type = 'gross_weight';
  if v_row.resolved_by is null and v_row.details->'resolution_history'->0->>'resolution_note' = 'preserve this audit note' then
    raise notice 'PASS: changed source result archives resolution metadata';
  else raise notice 'FAIL: changed result did not archive and clear its resolution'; end if;

  v_invalid := jsonb_set(jsonb_set(v_changed, '{4,value_a}', '"1002"'::jsonb), '{7,status}', '"invalid"'::jsonb);
  v_failed := false;
  begin
    perform public.persist_crosscheck_results(v_ship, v_actor, v_snapshot, v_invalid);
  exception when check_violation then v_failed := true;
  end;
  select * into v_row from public.crosscheck_results where shipment_id = v_ship and check_type = 'gross_weight';
  if v_failed and v_row.value_a = '1001' and v_row.details->'resolution_history'->0->>'resolution_note' = 'preserve this audit note' then
    raise notice 'PASS: failed recomputation preserves prior result and resolution history';
  else raise notice 'FAIL: failed recomputation altered existing result or resolution history'; end if;
end $$;

do $$
declare
  v_nulls int;
begin
  select count(*) filter (
    where supplier_id is null or ship_exec is null or ship_ok is null
      or ship_needs is null or ship_fail is null or edit_id is null
  ) into v_nulls
  from fx;
  if v_nulls = 0 then
    raise notice 'PASS: setup — fixture rows created (supplier, shipments, fields, field_edit)';
  else
    raise notice 'FAIL: setup — fixture rows incomplete (% column(s) null)', v_nulls;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Helper pattern used by every test:
--   set local role authenticated;
--   select set_config('request.jwt.claims', json_build_object('sub', <uuid>,
--     'role', 'authenticated')::text, true);
--   do $$ begin ... exception ... end $$;   -- explicit PASS/FAIL assertions
--   reset role;
--   select set_config('request.jwt.claims', '{}', true);
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- 1. Executive cannot set status Approved directly (RLS with check).
-- ---------------------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub',
  (select id from demo_users where app_role = 'documentation_executive'),
  'role', 'authenticated')::text, true);

do $$
declare
  v_ship uuid; v_exec uuid;
  v_before text; v_after text; v_n int;
begin
  select ship_exec into v_ship from fx;
  select id into v_exec from demo_users where app_role = 'documentation_executive';
  select status into v_before from public.shipments where id = v_ship;
  begin
    execute format('update public.shipments set status = %L where id = %L and created_by = %L',
      'Approved', v_ship, v_exec);
    get diagnostics v_n = row_count;
    select status into v_after from public.shipments where id = v_ship;
    if v_n = 0 and v_after = v_before then
      raise notice 'PASS: (1) executive cannot set status Approved directly';
    else
      raise notice 'FAIL: (1) executive cannot set status Approved directly (% row(s) updated, status % -> %)',
        v_n, v_before, v_after;
    end if;
  exception when others then
    select status into v_after from public.shipments where id = v_ship;
    if v_after = v_before then
      raise notice 'PASS: (1) executive cannot set status Approved directly (blocked: %)', sqlerrm;
    else
      raise notice 'FAIL: (1) executive cannot set status Approved directly (errored, but status changed: %)', sqlerrm;
    end if;
  end;
end $$;

reset role;
select set_config('request.jwt.claims', '{}', true);

-- ---------------------------------------------------------------------------
-- 2. Executive cannot call shipment_approve.
-- ---------------------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub',
  (select id from demo_users where app_role = 'documentation_executive'),
  'role', 'authenticated')::text, true);

do $$
declare
  v_ship uuid;
  v_before text; v_after text;
begin
  select ship_ok into v_ship from fx;
  select status into v_before from public.shipments where id = v_ship;
  begin
    execute format('select public.shipment_approve(%L, %L, %L)', v_ship, 'approved', 'test');
    select status into v_after from public.shipments where id = v_ship;
    raise notice 'FAIL: (2) executive cannot call shipment_approve (succeeded; status %)', v_after;
  exception when others then
    select status into v_after from public.shipments where id = v_ship;
    if v_after = v_before then
      raise notice 'PASS: (2) executive cannot call shipment_approve (blocked: %)', sqlerrm;
    else
      raise notice 'FAIL: (2) executive cannot call shipment_approve (errored but status changed: %)', sqlerrm;
    end if;
  end;
end $$;

reset role;
select set_config('request.jwt.claims', '{}', true);

-- ---------------------------------------------------------------------------
-- 3. Executive cannot call shipment_export.
-- ---------------------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub',
  (select id from demo_users where app_role = 'documentation_executive'),
  'role', 'authenticated')::text, true);

do $$
declare
  v_ship uuid;
  v_before text; v_after text;
begin
  select ship_ok into v_ship from fx;
  select status into v_before from public.shipments where id = v_ship;
  begin
    execute format('select public.shipment_export(%L)', v_ship);
    select status into v_after from public.shipments where id = v_ship;
    raise notice 'FAIL: (3) executive cannot call shipment_export (succeeded; status %)', v_after;
  exception when others then
    select status into v_after from public.shipments where id = v_ship;
    if v_after = v_before then
      raise notice 'PASS: (3) executive cannot call shipment_export (blocked: %)', sqlerrm;
    else
      raise notice 'FAIL: (3) executive cannot call shipment_export (errored but status changed: %)', sqlerrm;
    end if;
  end;
end $$;

reset role;
select set_config('request.jwt.claims', '{}', true);

-- ---------------------------------------------------------------------------
-- 4. Manager can approve and export a Ready-for-approval shipment with no
--    unresolved flags (positive control).
-- ---------------------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub',
  (select id from demo_users where app_role = 'documentation_manager'),
  'role', 'authenticated')::text, true);

do $$
declare
  v_ship uuid;
  v_st text;
begin
  select ship_ok into v_ship from fx;
  begin
    execute format('select public.shipment_approve(%L, %L, %L)', v_ship, 'approved', 'All checks pass');
    select status into v_st from public.shipments where id = v_ship;
    if v_st <> 'Approved' then
      raise notice 'FAIL: (4) manager can approve and export (approve succeeded but status is %)', v_st;
    else
      begin
        execute format('select public.shipment_export(%L)', v_ship);
        select status into v_st from public.shipments where id = v_ship;
        if v_st = 'Exported' then
          raise notice 'PASS: (4) manager can approve and export a Ready-for-approval shipment with no unresolved flags';
        else
          raise notice 'FAIL: (4) manager can approve and export (export succeeded but status is %)', v_st;
        end if;
      exception when others then
        raise notice 'FAIL: (4) manager can approve and export (export raised: %)', sqlerrm;
      end;
    end if;
  exception when others then
    raise notice 'FAIL: (4) manager can approve and export (approve raised: %)', sqlerrm;
  end;
end $$;

reset role;
select set_config('request.jwt.claims', '{}', true);

do $$
declare v_ship uuid; v_count integer;
begin
  select ship_ok into v_ship from fx;
  select count(*) into v_count from public.crosscheck_results where shipment_id=v_ship;
  if v_count <> 8 or exists(select 1 from public.crosscheck_results where shipment_id=v_ship and status <> 'pass') then
    raise exception 'Positive approval/export fixture must contain exactly eight passing checks';
  end if;
  if (select status from public.shipments where id=v_ship) <> 'Exported' then
    raise exception 'Manager approval/export positive fixture did not reach Exported';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 5a. Manager approval is refused while a field is needs_review.
-- ---------------------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub',
  (select id from demo_users where app_role = 'documentation_manager'),
  'role', 'authenticated')::text, true);

do $$
declare
  v_ship uuid;
  v_before text; v_after text;
begin
  select ship_needs into v_ship from fx;
  select status into v_before from public.shipments where id = v_ship;
  begin
    execute format('select public.shipment_approve(%L, %L, %L)', v_ship, 'approved', 'should be refused');
    select status into v_after from public.shipments where id = v_ship;
    raise notice 'FAIL: (5a) manager approval refused while a field is needs_review (succeeded; status %)', v_after;
  exception when others then
    select status into v_after from public.shipments where id = v_ship;
    if v_after = v_before then
      raise notice 'PASS: (5a) manager approval refused while a field is needs_review (blocked: %)', sqlerrm;
    else
      raise notice 'FAIL: (5a) manager approval refused while a field is needs_review (errored but status changed: %)', sqlerrm;
    end if;
  end;
end $$;

reset role;
select set_config('request.jwt.claims', '{}', true);

-- ---------------------------------------------------------------------------
-- 5b. Manager approval is refused while a failed cross-check is unresolved.
-- ---------------------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub',
  (select id from demo_users where app_role = 'documentation_manager'),
  'role', 'authenticated')::text, true);

do $$
declare
  v_ship uuid;
  v_before text; v_after text;
begin
  select ship_fail into v_ship from fx;
  select status into v_before from public.shipments where id = v_ship;
  begin
    execute format('select public.shipment_approve(%L, %L, %L)', v_ship, 'approved', 'should be refused');
    select status into v_after from public.shipments where id = v_ship;
    raise notice 'FAIL: (5b) manager approval refused while a failed cross-check is unresolved (succeeded; status %)', v_after;
  exception when others then
    select status into v_after from public.shipments where id = v_ship;
    if v_after = v_before then
      raise notice 'PASS: (5b) manager approval refused while a failed cross-check is unresolved (blocked: %)', sqlerrm;
    else
      raise notice 'FAIL: (5b) manager approval refused while a failed cross-check is unresolved (errored but status changed: %)', sqlerrm;
    end if;
  end;
end $$;

reset role;
select set_config('request.jwt.claims', '{}', true);

-- ---------------------------------------------------------------------------
-- 5b2. A failed check with a complete manager resolution remains overridable.
-- ---------------------------------------------------------------------------
update public.crosscheck_results c set
  resolved_by = (select id from demo_users where app_role = 'documentation_manager'),
  resolved_at = now(), resolution_note = 'Audited override per existing policy'
where c.shipment_id = (select ship_fail from fx) and c.check_type = 'gross_weight';

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub',
  (select id from demo_users where app_role = 'documentation_manager'),
  'role', 'authenticated')::text, true);

do $$
declare v_ship uuid; v_status text;
begin
  select ship_fail into v_ship from fx;
  begin
    execute format('select public.shipment_approve(%L, %L, %L)', v_ship, 'approved', 'Approved with audited override');
    execute format('select public.shipment_export(%L)', v_ship);
    select status into v_status from public.shipments where id = v_ship;
    if v_status = 'Exported' then raise notice 'PASS: complete audited fail resolution permits approval and export';
    else raise notice 'FAIL: resolved fail ended in status %', v_status; end if;
  exception when others then raise notice 'FAIL: complete audited fail resolution was rejected: %', sqlerrm;
  end;
end $$;

reset role;
select set_config('request.jwt.claims', '{}', true);

-- ---------------------------------------------------------------------------
-- 5c. cannot_check is unresolved and blocks approval.
-- ---------------------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub',
  (select id from demo_users where app_role = 'documentation_manager'),
  'role', 'authenticated')::text, true);

do $$
declare v_ship uuid; v_before text; v_after text;
begin
  select ship_cannot_approve into v_ship from fx;
  select status into v_before from public.shipments where id = v_ship;
  begin
    execute format('select public.shipment_approve(%L, %L, %L)', v_ship, 'approved', 'should be refused');
    raise notice 'FAIL: (5c) cannot_check cross-check blocked approval';
  exception when others then
    select status into v_after from public.shipments where id = v_ship;
    if v_after = v_before then raise notice 'PASS: (5c) cannot_check cross-check blocked approval';
    else raise notice 'FAIL: (5c) approval changed shipment status after cannot_check'; end if;
  end;
end $$;

do $$
declare v_ship uuid;
begin
  select ship_cannot_export into v_ship from fx;
  begin
    execute format('select public.shipment_export(%L)', v_ship);
    raise notice 'FAIL: (5d) cannot_check cross-check blocked export';
  exception when others then raise notice 'PASS: (5d) cannot_check cross-check blocked export';
  end;
end $$;

reset role;
select set_config('request.jwt.claims', '{}', true);

-- ---------------------------------------------------------------------------
-- 6a. field_edits cannot be updated by executive.
-- ---------------------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub',
  (select id from demo_users where app_role = 'documentation_executive'),
  'role', 'authenticated')::text, true);

do $$
declare
  v_edit uuid;
  v_before text; v_after text; v_n int;
begin
  select edit_id into v_edit from fx;
  select new_value into v_before from public.field_edits where id = v_edit;
  begin
    execute format('update public.field_edits set new_value = %L where id = %L',
      'tampered-by-executive', v_edit);
    get diagnostics v_n = row_count;
    select new_value into v_after from public.field_edits where id = v_edit;
    if v_n = 0 and v_after = v_before then
      raise notice 'PASS: (6a) field_edits cannot be updated by executive';
    else
      raise notice 'FAIL: (6a) field_edits cannot be updated by executive (% row(s), value % -> %)', v_n, v_before, v_after;
    end if;
  exception when others then
    select new_value into v_after from public.field_edits where id = v_edit;
    if v_after = v_before then
      raise notice 'PASS: (6a) field_edits cannot be updated by executive (blocked: %)', sqlerrm;
    else
      raise notice 'FAIL: (6a) field_edits cannot be updated by executive (errored but value changed: %)', sqlerrm;
    end if;
  end;
end $$;

reset role;
select set_config('request.jwt.claims', '{}', true);

-- ---------------------------------------------------------------------------
-- 6b. field_edits cannot be deleted by executive.
-- ---------------------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub',
  (select id from demo_users where app_role = 'documentation_executive'),
  'role', 'authenticated')::text, true);

do $$
declare
  v_edit uuid;
  v_before text; v_after text; v_n int;
begin
  select edit_id into v_edit from fx;
  select new_value into v_before from public.field_edits where id = v_edit;
  begin
    execute format('delete from public.field_edits where id = %L', v_edit);
    get diagnostics v_n = row_count;
    select new_value into v_after from public.field_edits where id = v_edit;
    if v_n = 0 and v_after = v_before then
      raise notice 'PASS: (6b) field_edits cannot be deleted by executive';
    else
      raise notice 'FAIL: (6b) field_edits cannot be deleted by executive (% row(s), value % -> %)', v_n, v_before, v_after;
    end if;
  exception when others then
    select new_value into v_after from public.field_edits where id = v_edit;
    if v_after = v_before then
      raise notice 'PASS: (6b) field_edits cannot be deleted by executive (blocked: %)', sqlerrm;
    else
      raise notice 'FAIL: (6b) field_edits cannot be deleted by executive (errored but value changed: %)', sqlerrm;
    end if;
  end;
end $$;

reset role;
select set_config('request.jwt.claims', '{}', true);

-- ---------------------------------------------------------------------------
-- 6c. field_edits cannot be updated by manager.
-- ---------------------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub',
  (select id from demo_users where app_role = 'documentation_manager'),
  'role', 'authenticated')::text, true);

do $$
declare
  v_edit uuid;
  v_before text; v_after text; v_n int;
begin
  select edit_id into v_edit from fx;
  select new_value into v_before from public.field_edits where id = v_edit;
  begin
    execute format('update public.field_edits set new_value = %L where id = %L',
      'tampered-by-manager', v_edit);
    get diagnostics v_n = row_count;
    select new_value into v_after from public.field_edits where id = v_edit;
    if v_n = 0 and v_after = v_before then
      raise notice 'PASS: (6c) field_edits cannot be updated by manager';
    else
      raise notice 'FAIL: (6c) field_edits cannot be updated by manager (% row(s), value % -> %)', v_n, v_before, v_after;
    end if;
  exception when others then
    select new_value into v_after from public.field_edits where id = v_edit;
    if v_after = v_before then
      raise notice 'PASS: (6c) field_edits cannot be updated by manager (blocked: %)', sqlerrm;
    else
      raise notice 'FAIL: (6c) field_edits cannot be updated by manager (errored but value changed: %)', sqlerrm;
    end if;
  end;
end $$;

reset role;
select set_config('request.jwt.claims', '{}', true);

-- ---------------------------------------------------------------------------
-- 6d. field_edits cannot be deleted by manager.
-- ---------------------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub',
  (select id from demo_users where app_role = 'documentation_manager'),
  'role', 'authenticated')::text, true);

do $$
declare
  v_edit uuid;
  v_before text; v_after text; v_n int;
begin
  select edit_id into v_edit from fx;
  select new_value into v_before from public.field_edits where id = v_edit;
  begin
    execute format('delete from public.field_edits where id = %L', v_edit);
    get diagnostics v_n = row_count;
    select new_value into v_after from public.field_edits where id = v_edit;
    if v_n = 0 and v_after = v_before then
      raise notice 'PASS: (6d) field_edits cannot be deleted by manager';
    else
      raise notice 'FAIL: (6d) field_edits cannot be deleted by manager (% row(s), value % -> %)', v_n, v_before, v_after;
    end if;
  exception when others then
    select new_value into v_after from public.field_edits where id = v_edit;
    if v_after = v_before then
      raise notice 'PASS: (6d) field_edits cannot be deleted by manager (blocked: %)', sqlerrm;
    else
      raise notice 'FAIL: (6d) field_edits cannot be deleted by manager (errored but value changed: %)', sqlerrm;
    end if;
  end;
end $$;

reset role;
select set_config('request.jwt.claims', '{}', true);

-- ---------------------------------------------------------------------------
-- 7. Executive can insert a field_edit (insert-only audit log).
-- ---------------------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub',
  (select id from demo_users where app_role = 'documentation_executive'),
  'role', 'authenticated')::text, true);

do $$
declare
  v_ship uuid; v_doc uuid; v_exec uuid; v_supplier uuid;
  v_new uuid; v_n int;
begin
  select ship_exec into v_ship from fx;
  select doc_exec into v_doc from fx;
  select supplier_id into v_supplier from fx;
  select id into v_exec from demo_users where app_role = 'documentation_executive';
  begin
    execute format(
      'insert into public.field_edits (shipment_id, field_key, document_id, old_value, new_value, action, user_id, supplier_id)
       values (%L, %L, %L, %L, %L, %L, %L, %L) returning id',
      v_ship, 'invoice_total', v_doc, '1000', '1050', 'edit', v_exec, v_supplier)
    into v_new;
    select count(*) into v_n from public.field_edits where id = v_new;
    if v_n = 1 then
      raise notice 'PASS: (7) executive can insert a field_edit';
    else
      raise notice 'FAIL: (7) executive can insert a field_edit (inserted row not found)';
    end if;
  exception when others then
    raise notice 'FAIL: (7) executive can insert a field_edit (raised: %)', sqlerrm;
  end;
end $$;

reset role;
select set_config('request.jwt.claims', '{}', true);

-- ---------------------------------------------------------------------------
-- 8. Unauthenticated (anon) user can read nothing from shipments.
-- ---------------------------------------------------------------------------
set local role anon;
select set_config('request.jwt.claims', '{}', true);

do $$
declare
  v_n int;
begin
  begin
    select count(*) into v_n from public.shipments;
    if v_n = 0 then
      raise notice 'PASS: (8) unauthenticated (anon) user can read nothing from shipments';
    else
      raise notice 'FAIL: (8) unauthenticated (anon) user can read nothing from shipments (% row(s) visible)', v_n;
    end if;
  exception when others then
    raise notice 'PASS: (8) unauthenticated (anon) user can read nothing from shipments (read blocked: %)', sqlerrm;
  end;
end $$;

reset role;
select set_config('request.jwt.claims', '{}', true);

-- ---------------------------------------------------------------------------
-- Phase 1.2 regression assertions. These raise exceptions on failure so SQL
-- runners receive a failed transaction rather than a misleading PASS/FAIL log.
-- ---------------------------------------------------------------------------

-- Executive RLS cannot change their own owner or claim another user's row.
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub',
  (select id from demo_users where app_role = 'documentation_executive'),
  'role', 'authenticated')::text, true);
do $$
declare v_own uuid; v_other uuid; v_exec uuid; v_manager uuid; v_rows integer; v_created uuid;
begin
  select ship_exec, ship_other_owner into v_own, v_other from fx;
  select id into v_exec from demo_users where app_role='documentation_executive';
  select id into v_manager from demo_users where app_role='documentation_manager';
  begin
    update public.shipments set created_by=v_manager where id=v_own;
    get diagnostics v_rows = row_count;
  exception when others then v_rows := 0;
  end;
  if v_rows <> 0 then raise exception 'Executive changed owner of their own shipment'; end if;
  begin
    update public.shipments set created_by=v_exec where id=v_other;
    get diagnostics v_rows = row_count;
  exception when others then v_rows := 0;
  end;
  if v_rows <> 0 then raise exception 'Executive claimed another user shipment'; end if;
  insert into public.shipments(shipment_number, supplier_id, status, created_by)
    select 'SHP-EXEC-INSERT-001', supplier_id, 'Draft', v_exec from fx
    returning id into v_created;
  if v_created is null then raise exception 'Executive could not create a shipment for their own account'; end if;
  v_created := null;
  begin
    insert into public.shipments(shipment_number, supplier_id, status, created_by)
      select 'SHP-EXEC-SPOOF-001', supplier_id, 'Draft', v_manager from fx
      returning id into v_created;
  exception when others then v_created := null;
  end;
  if v_created is not null then raise exception 'Executive created a shipment owned by another user'; end if;
end $$;
reset role;
select set_config('request.jwt.claims', '{}', true);
do $$
declare v_exec uuid; v_manager uuid; v_own uuid; v_other uuid;
begin
  select id into v_exec from demo_users where app_role='documentation_executive';
  select id into v_manager from demo_users where app_role='documentation_manager';
  select ship_exec, ship_other_owner into v_own, v_other from fx;
  if (select created_by from public.shipments where id=v_own) is distinct from v_exec
    or (select created_by from public.shipments where id=v_other) is distinct from v_manager then
    raise exception 'A rejected executive ownership update changed shipment ownership';
  end if;
end $$;

-- A service-role REST update bypasses RLS, but the invoker trigger still denies it.
set local role service_role;
do $$
declare v_ship uuid; v_exec uuid; v_rejected boolean := false; v_message text;
begin
  select ship_other_owner into v_ship from fx;
  select id into v_exec from demo_users where app_role='documentation_executive';
  begin update public.shipments set created_by=v_exec where id=v_ship;
  exception when others then v_rejected := true; v_message := sqlerrm; end;
  if not v_rejected or v_message not like '%Shipment ownership changes require the authorized transfer function%' then
    raise exception 'service_role bypassed shipment ownership trigger (message: %)', v_message;
  end if;
end $$;
reset role;

-- Only an authorized manager can transfer, and the operation records its reason.
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub',
  (select id from demo_users where app_role = 'documentation_manager'),
  'role', 'authenticated')::text, true);
do $$
declare v_ship uuid; v_exec uuid; v_manager uuid;
begin
  select ship_other_owner into v_ship from fx;
  select id into v_exec from demo_users where app_role='documentation_executive';
  select id into v_manager from demo_users where app_role='documentation_manager';
  perform public.transfer_shipment_ownership(v_ship, v_exec, 'Regression test transfer');
  if (select created_by from public.shipments where id=v_ship) is distinct from v_exec
    or not exists(select 1 from public.shipment_ownership_transfers
      where shipment_id=v_ship and previous_owner=v_manager and new_owner=v_exec
        and transferred_by=v_manager and reason='Regression test transfer') then
    raise exception 'Authorized ownership transfer or its audit row was not persisted';
  end if;
end $$;
reset role;
select set_config('request.jwt.claims', '{}', true);

-- Approval and both export RPCs reject a complete-looking shipment missing a check.
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub',
  (select id from demo_users where app_role = 'documentation_manager'),
  'role', 'authenticated')::text, true);
do $$
declare v_approve uuid; v_export uuid; v_rejected boolean;
begin
  select ship_incomplete_approve, ship_incomplete_export into v_approve, v_export from fx;
  v_rejected := false;
  begin perform public.shipment_approve(v_approve, 'approved', 'must reject incomplete checks');
  exception when others then v_rejected := true; end;
  if not v_rejected or (select status from public.shipments where id=v_approve) <> 'Ready for approval' then
    raise exception 'Approval accepted an incomplete eight-check set or changed state';
  end if;
  v_rejected := false;
  begin perform public.shipment_export(v_export);
  exception when others then v_rejected := true; end;
  if not v_rejected or (select status from public.shipments where id=v_export) <> 'Approved' then
    raise exception 'shipment_export accepted an incomplete eight-check set or changed state';
  end if;
  v_rejected := false;
  begin perform public.shipment_export_snapshot(v_export);
  exception when others then v_rejected := true; end;
  if not v_rejected or (select status from public.shipments where id=v_export) <> 'Approved' then
    raise exception 'shipment_export_snapshot accepted an incomplete eight-check set or changed state';
  end if;
end $$;
reset role;
select set_config('request.jwt.claims', '{}', true);

-- A full-cardinality set containing an unexpected type is not accepted either.
update public.crosscheck_results set check_type='unexpected_check'
  where shipment_id=(select ship_cannot_export from fx) and check_type='gross_weight';
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub',
  (select id from demo_users where app_role = 'documentation_manager'),
  'role', 'authenticated')::text, true);
do $$
declare v_ship uuid; v_rejected boolean := false;
begin
  select ship_cannot_export into v_ship from fx;
  begin perform public.shipment_export_snapshot(v_ship);
  exception when others then v_rejected := true; end;
  if not v_rejected then raise exception 'Export accepted eight rows containing an unexpected check type'; end if;
end $$;
reset role;
select set_config('request.jwt.claims', '{}', true);
update public.crosscheck_results set check_type='gross_weight'
  where shipment_id=(select ship_cannot_export from fx) and check_type='unexpected_check';

-- Source edits on an approved shipment atomically invalidate checks and approval.
-- First inject an invalidation failure and assert that the source and approval roll back.
create function public.test_fail_crosscheck_invalidation()
returns trigger language plpgsql as $$
begin raise exception 'Injected cross-check invalidation failure'; end;
$$;
create trigger test_fail_crosscheck_invalidation
  before update on public.crosscheck_results for each row
  execute function public.test_fail_crosscheck_invalidation();
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub',
  (select id from demo_users where app_role = 'documentation_executive'),
  'role', 'authenticated')::text, true);
do $$
declare v_ship uuid; v_field uuid; v_before text; v_rejected boolean := false;
begin
  select ship_source_approved into v_ship from fx;
  select id, value into v_field, v_before from public.fields where shipment_id=v_ship;
  begin update public.fields set value='rollback probe' where id=v_field;
  exception when others then v_rejected := true; end;
  if not v_rejected or (select value from public.fields where id=v_field) is distinct from v_before
    or not exists(select 1 from public.shipments where id=v_ship and status='Approved'
      and approved_by=(select id from demo_users where app_role='documentation_manager')
      and approved_at is not null and approval_reason='approval metadata fixture') then
    raise exception 'Failed invalidation did not roll source edit and approval reset back atomically';
  end if;
end $$;
reset role;
select set_config('request.jwt.claims', '{}', true);
drop trigger test_fail_crosscheck_invalidation on public.crosscheck_results;
drop function public.test_fail_crosscheck_invalidation();

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub',
  (select id from demo_users where app_role = 'documentation_executive'),
  'role', 'authenticated')::text, true);
do $$
declare v_ship uuid; v_field uuid;
begin
  select ship_source_approved into v_ship from fx;
  select id into v_field from public.fields where shipment_id=v_ship;
  update public.fields set value='1002' where id=v_field;
  if not exists(select 1 from public.shipments where id=v_ship and status='Needs review'
      and approved_by is null and approved_at is null and approval_reason is null) then
    raise exception 'Source edit failed to clear approval status and metadata';
  end if;
  if not exists(select 1 from public.crosscheck_results where shipment_id=v_ship
      and status='cannot_check' and resolved_by is null and resolved_at is null and resolution_note is null
      and details->'resolution_history'->0->>'resolution_note'='source approval test resolution') then
    raise exception 'Source edit failed to invalidate checks or archive their resolution';
  end if;
end $$;
reset role;
select set_config('request.jwt.claims', '{}', true);

-- Document insertions and line-item changes use the same source lock/approval reset.
update public.crosscheck_results set status='pass' where shipment_id=(select ship_source_approved from fx);
update public.shipments set status='Approved',
  approved_by=(select id from demo_users where app_role='documentation_manager'),
  approved_at=now(), approval_reason='document trigger fixture'
where id=(select ship_source_approved from fx);
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub',
  (select id from demo_users where app_role = 'documentation_executive'),
  'role', 'authenticated')::text, true);
do $$
declare v_ship uuid;
begin
  select ship_source_approved into v_ship from fx;
  insert into public.documents(shipment_id,type,storage_path,file_name)
    values(v_ship,'packing_list','tests/approved-document-edit.pdf','approved-document-edit.pdf');
  if not exists(select 1 from public.shipments where id=v_ship and status='Needs review'
      and approved_by is null and approved_at is null and approval_reason is null) then
    raise exception 'Document insert did not invalidate the approval';
  end if;
end $$;
reset role;
select set_config('request.jwt.claims', '{}', true);
update public.crosscheck_results set status='pass' where shipment_id=(select ship_source_approved from fx);
update public.shipments set status='Approved',
  approved_by=(select id from demo_users where app_role='documentation_manager'),
  approved_at=now(), approval_reason='line item trigger fixture'
where id=(select ship_source_approved from fx);
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub',
  (select id from demo_users where app_role = 'documentation_executive'),
  'role', 'authenticated')::text, true);
do $$
declare v_ship uuid; v_doc uuid;
begin
  select ship_source_approved into v_ship from fx;
  select id into v_doc from public.documents where shipment_id=v_ship order by created_at limit 1;
  insert into public.line_items(shipment_id,document_id,description,qty,unit_price,line_total,status)
    values(v_ship,v_doc,'approval invalidation test',1,10,10,'confirmed');
  if not exists(select 1 from public.shipments where id=v_ship and status='Needs review'
      and approved_by is null and approved_at is null and approval_reason is null) then
    raise exception 'Line-item insert did not invalidate the approval';
  end if;
end $$;
reset role;
select set_config('request.jwt.claims', '{}', true);

-- A non-approved source edit leaves its workflow status alone and invalidates checks.
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub',
  (select id from demo_users where app_role = 'documentation_executive'),
  'role', 'authenticated')::text, true);
do $$
declare v_ship uuid; v_exec uuid; v_count integer;
begin
  select ship_exec into v_ship from fx;
  select id into v_exec from demo_users where app_role='documentation_executive';
  insert into public.documents(shipment_id,type,storage_path,file_name)
    values(v_ship,'packing_list','tests/non-approved-edit.pdf','non-approved-edit.pdf');
  select count(*) into v_count from public.crosscheck_results
    where shipment_id=v_ship and status='cannot_check';
  if (select status from public.shipments where id=v_ship) <> 'Draft' or v_count <> 8 then
    raise exception 'Non-approved source edit changed workflow status or failed to invalidate checks';
  end if;
end $$;
reset role;
select set_config('request.jwt.claims', '{}', true);

-- Exported source rows are immutable; prior export records and status remain.
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub',
  (select id from demo_users where app_role = 'documentation_executive'),
  'role', 'authenticated')::text, true);
do $$
declare v_ship uuid; v_field uuid; v_exports integer; v_rejected boolean := false;
begin
  select ship_fail into v_ship from fx;
  select id into v_field from public.fields where shipment_id=v_ship;
  select count(*) into v_exports from public.exports where shipment_id=v_ship;
  begin update public.fields set value='after export' where id=v_field;
  exception when others then v_rejected := true; end;
  if not v_rejected or (select status from public.shipments where id=v_ship) <> 'Exported'
    or (select count(*) from public.exports where shipment_id=v_ship) <> v_exports then
    raise exception 'Exported shipment source mutation was not rejected without preserving export state';
  end if;
end $$;
reset role;
select set_config('request.jwt.claims', '{}', true);

raise notice '== database/tests.sql: finished. All fixture rows were rolled back; nothing was left behind. ==';
rollback;

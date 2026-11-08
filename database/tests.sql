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
--   * database/schema.sql and migrations/003_crosscheck_integrity.sql applied to the test database.
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

grant select on demo_users to authenticated, anon;

do $$
declare
  v_users int;
begin
  select count(*) into v_users from demo_users;
  if v_users = 2 then
    raise notice 'PASS: setup — demo users resolved from auth.users (exec@demo.local, manager@demo.local)';
  else
    raise notice 'FAIL: setup — expected 2 demo users in auth.users, found % (need exec@demo.local and manager@demo.local)', v_users;
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
  doc_exec uuid,
  doc_ok uuid,
  doc_needs uuid,
  doc_fail uuid,
  edit_id uuid
);

grant select on fx to authenticated, anon;

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

update fx set
  supplier_id = (select id from public.suppliers where name = 'Demo Supplier'),
  ship_exec   = (select id from public.shipments where shipment_number = 'SHP-EXEC-001'),
  ship_ok     = (select id from public.shipments where shipment_number = 'SHP-OK-001'),
  ship_needs  = (select id from public.shipments where shipment_number = 'SHP-NEEDS-001'),
  ship_fail   = (select id from public.shipments where shipment_number = 'SHP-FAIL-001');
update fx set
  ship_cannot_approve = (select id from public.shipments where shipment_number = 'SHP-CANNOT-APPROVE-001'),
  ship_cannot_export = (select id from public.shipments where shipment_number = 'SHP-CANNOT-EXPORT-001');

insert into public.documents (shipment_id, type, storage_path, file_name)
select ship_exec, 'invoice', 'tests/SHP-EXEC-001/invoice.pdf', 'invoice.pdf' from fx;
insert into public.documents (shipment_id, type, storage_path, file_name)
select ship_ok, 'invoice', 'tests/SHP-OK-001/invoice.pdf', 'invoice.pdf' from fx;
insert into public.documents (shipment_id, type, storage_path, file_name)
select ship_needs, 'invoice', 'tests/SHP-NEEDS-001/invoice.pdf', 'invoice.pdf' from fx;
insert into public.documents (shipment_id, type, storage_path, file_name)
select ship_fail, 'invoice', 'tests/SHP-FAIL-001/invoice.pdf', 'invoice.pdf' from fx;

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
insert into public.crosscheck_results (shipment_id, check_type, status, value_a, value_b, fields_involved)
select ship_fail, 'gross_weight', 'fail', '1000', '1001', array['gross_weight_kg'] from fx;
insert into public.crosscheck_results (shipment_id, check_type, status, fields_involved)
select ship_cannot_approve, 'gross_weight', 'cannot_check', array['gross_weight_kg'] from fx;
insert into public.crosscheck_results
  (shipment_id, check_type, status, fields_involved, resolved_by, resolved_at, resolution_note)
select ship_cannot_export, 'gross_weight', 'cannot_check', array['gross_weight_kg'], d.id, now(), 'recorded but cannot override missing evidence'
from fx, demo_users d where d.app_role = 'documentation_manager';

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

raise notice '== database/tests.sql: finished. All fixture rows were rolled back; nothing was left behind. ==';
rollback;

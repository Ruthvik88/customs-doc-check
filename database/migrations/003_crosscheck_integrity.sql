-- Phase 1.1. Review the duplicate report before running this migration.
begin;
lock table public.crosscheck_results in access exclusive mode;

-- Read-only preflight:
-- select shipment_id, check_type, array_agg(id order by created_at, id) as record_ids,
--        count(*) as duplicate_count,
--        jsonb_agg(jsonb_build_object('id', id, 'resolved_by', resolved_by,
--          'resolved_at', resolved_at, 'resolution_note', resolution_note,
--          'details', details) order by created_at, id) as resolution_records
-- from public.crosscheck_results
-- group by shipment_id, check_type having count(*) > 1;
-- If this returns rows, stop and reconcile each group manually. Do not delete or merge.

do $$
begin
  if exists (
    select 1 from public.crosscheck_results
    group by shipment_id, check_type having count(*) > 1
  ) then
    raise exception 'Duplicate cross-check rows exist; inspect the read-only preflight report and reconcile manually';
  end if;
end $$;

alter table public.crosscheck_results
  add constraint crosscheck_results_shipment_check_type_key unique (shipment_id, check_type);

-- Source writers and cross-check persistence all lock the shipment row first.
create or replace function public.lock_shipment_for_source_change()
returns trigger language plpgsql security definer
set search_path = pg_catalog, public
as $$
declare
  v_shipment_id uuid;
begin
  if tg_op = 'UPDATE' and old.shipment_id is distinct from new.shipment_id then
    raise exception 'Moving source rows between shipments is not supported';
  end if;
  v_shipment_id := coalesce(new.shipment_id, old.shipment_id);
  perform 1 from public.shipments where id = v_shipment_id for update;
  if not found then
    if tg_op = 'DELETE' then return old; end if;
    raise exception 'Shipment not found';
  end if;
  -- Multiple REST calls can make one extraction workflow. Invalidate old
  -- checks on its first source write so approval cannot consume stale results.
  update public.crosscheck_results c
  set status = 'cannot_check',
      details = coalesce(c.details, '{}'::jsonb) || jsonb_build_object(
        'source_change_history',
        coalesce(c.details->'source_change_history', '[]'::jsonb) || jsonb_build_array(jsonb_build_object(
          'recorded_at', now(), 'status', c.status, 'value_a', c.value_a,
          'value_b', c.value_b, 'delta', c.delta, 'fields_involved', c.fields_involved,
          'details', coalesce(c.details, '{}'::jsonb))))
        || case when c.resolved_by is not null or c.resolved_at is not null or c.resolution_note is not null
          then jsonb_build_object('resolution_history',
            coalesce(c.details->'resolution_history', '[]'::jsonb) || jsonb_build_array(jsonb_build_object(
              'status', c.status, 'value_a', c.value_a, 'value_b', c.value_b, 'delta', c.delta,
              'fields_involved', c.fields_involved, 'resolved_by', c.resolved_by,
              'resolved_at', c.resolved_at, 'resolution_note', c.resolution_note)))
          else '{}'::jsonb end,
      resolved_by = null,
      resolved_at = null,
      resolution_note = null,
      updated_at = now()
  where c.shipment_id = v_shipment_id and (c.status <> 'cannot_check'
    or c.resolved_by is not null or c.resolved_at is not null or c.resolution_note is not null);
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

create trigger trg_documents_lock_shipment
  before insert or update or delete on public.documents
  for each row execute function public.lock_shipment_for_source_change();
create trigger trg_fields_lock_shipment
  before insert or update or delete on public.fields
  for each row execute function public.lock_shipment_for_source_change();
create trigger trg_line_items_lock_shipment
  before insert or update or delete on public.line_items
  for each row execute function public.lock_shipment_for_source_change();

create or replace function public.persist_crosscheck_results(
  p_shipment_id uuid,
  p_actor_id uuid,
  p_source_snapshot jsonb,
  p_results jsonb
) returns void
language plpgsql security definer
set search_path = pg_catalog, public, auth
as $$
declare
  v_owner uuid;
  v_role text;
  v_status text;
  v_actual jsonb;
  v_item jsonb;
  v_existing public.crosscheck_results%rowtype;
  v_details jsonb;
  v_history jsonb;
  v_source_history jsonb;
  v_unchanged boolean;
  v_expected text[] := array['invoice_total','line_item_math','line_item_qty','total_packages',
    'gross_weight','container_numbers','currency_incoterm','supplier_consistency'];
  v_received text[];
begin
  select s.created_by, s.status into v_owner, v_status from public.shipments s
    where s.id = p_shipment_id for update;
  if not found then raise exception 'Shipment not found'; end if;
  if v_status in ('Approved', 'Exported') then
    raise exception 'Cross-checks cannot be recomputed after approval or export';
  end if;
  select p.role into v_role from public.profiles p where p.id = p_actor_id;
  if v_role <> 'documentation_executive' or v_owner <> p_actor_id then
    raise exception 'Not authorized to recompute this shipment';
  end if;

  select array_agg(x.check_type order by x.check_type) into v_received
    from jsonb_to_recordset(p_results) as x(check_type text);
  if jsonb_typeof(p_results) <> 'array' or cardinality(v_received) <> cardinality(v_expected)
    or (select array_agg(t order by t) from unnest(v_expected) t) is distinct from v_received
  then raise exception 'Invalid or incomplete cross-check result set'; end if;

  select jsonb_build_object(
    'documents', coalesce((select jsonb_agg(to_jsonb(d) order by d.id) from public.documents d where d.shipment_id = p_shipment_id), '[]'::jsonb),
    'fields', coalesce((select jsonb_agg(to_jsonb(f) order by f.id) from public.fields f where f.shipment_id = p_shipment_id), '[]'::jsonb),
    'line_items', coalesce((select jsonb_agg(to_jsonb(li) order by li.id) from public.line_items li where li.shipment_id = p_shipment_id), '[]'::jsonb)
  ) into v_actual;
  if v_actual is distinct from p_source_snapshot then
    raise exception 'Shipment source data changed during recomputation';
  end if;

  for v_item in select value from jsonb_array_elements(p_results)
  loop
    select * into v_existing from public.crosscheck_results
      where shipment_id = p_shipment_id and check_type = v_item->>'check_type' for update;
    v_unchanged := false;
    v_details := coalesce(v_item->'details', '{}'::jsonb);
    if found then
      v_history := case when jsonb_typeof(v_existing.details->'resolution_history') = 'array'
        then v_existing.details->'resolution_history' else '[]'::jsonb end;
      v_source_history := case when jsonb_typeof(v_existing.details->'source_change_history') = 'array'
        then v_existing.details->'source_change_history' else '[]'::jsonb end;
      v_unchanged := v_existing.status = v_item->>'status'
        and v_existing.value_a is not distinct from v_item->>'value_a'
        and v_existing.value_b is not distinct from v_item->>'value_b'
        and v_existing.delta is not distinct from v_item->>'delta'
        and v_existing.fields_involved is not distinct from array(select jsonb_array_elements_text(v_item->'fields_involved'))
        and (coalesce(v_existing.details, '{}'::jsonb) - 'resolution_history' - 'source_change_history') = v_details;
      if v_unchanged then
        if jsonb_array_length(v_history) > 0 then v_details := v_details || jsonb_build_object('resolution_history', v_history); end if;
      else
        if v_existing.resolved_by is not null or v_existing.resolved_at is not null or v_existing.resolution_note is not null then
          v_history := v_history || jsonb_build_array(jsonb_build_object(
            'status', v_existing.status, 'value_a', v_existing.value_a, 'value_b', v_existing.value_b,
            'delta', v_existing.delta, 'fields_involved', v_existing.fields_involved,
            'resolved_by', v_existing.resolved_by, 'resolved_at', v_existing.resolved_at,
            'resolution_note', v_existing.resolution_note));
        end if;
        if jsonb_array_length(v_history) > 0 then v_details := v_details || jsonb_build_object('resolution_history', v_history); end if;
      end if;
      if jsonb_array_length(v_source_history) > 0 then
        v_details := v_details || jsonb_build_object('source_change_history', v_source_history);
      end if;
    else
      v_history := '[]'::jsonb;
      v_source_history := '[]'::jsonb;
    end if;

    insert into public.crosscheck_results
      (shipment_id, check_type, status, value_a, value_b, delta, fields_involved, details,
       resolved_by, resolved_at, resolution_note)
    values (p_shipment_id, v_item->>'check_type', v_item->>'status', v_item->>'value_a',
      v_item->>'value_b', v_item->>'delta',
      array(select jsonb_array_elements_text(v_item->'fields_involved')), v_details,
      case when v_unchanged then v_existing.resolved_by else null end,
      case when v_unchanged then v_existing.resolved_at else null end,
      case when v_unchanged then v_existing.resolution_note else null end)
    on conflict (shipment_id, check_type) do update set
      status = excluded.status, value_a = excluded.value_a, value_b = excluded.value_b,
      delta = excluded.delta, fields_involved = excluded.fields_involved, details = excluded.details,
      resolved_by = excluded.resolved_by, resolved_at = excluded.resolved_at,
      resolution_note = excluded.resolution_note, updated_at = now();
  end loop;
end;
$$;

revoke all on function public.persist_crosscheck_results(uuid, uuid, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.persist_crosscheck_results(uuid, uuid, jsonb, jsonb) to service_role;

-- Approval/export serialize on the shipment row before checking gates.
create or replace function public.shipment_approve(p_shipment_id uuid, p_decision text, p_reason text)
returns void language plpgsql security definer
set search_path = pg_catalog, public, auth
as $$
declare caller text; cur_status text;
begin
  caller := public.current_app_role();
  if caller <> 'documentation_manager' then raise exception 'Only documentation_manager can approve/reject shipments'; end if;
  select s.status into cur_status from public.shipments s where s.id = $1 for update;
  if cur_status is null then raise exception 'Shipment not found'; end if;
  if cur_status not in ('Ready for approval','Needs review') then raise exception 'Shipment is not in an approvable state (current: %)', cur_status; end if;
  if $2 = 'approved' then
    if exists (select 1 from public.fields f where f.shipment_id = $1 and f.status = 'needs_review') then raise exception 'Cannot approve: shipment has field(s) needing review'; end if;
    if exists (select 1 from public.crosscheck_results c where c.shipment_id = $1 and (c.status = 'cannot_check' or (c.status = 'fail' and (c.resolved_by is null or c.resolved_at is null or nullif(btrim(c.resolution_note), '') is null)))) then raise exception 'Cannot approve: shipment has unresolved cross-check(s)'; end if;
  elsif $2 <> 'rejected' then raise exception 'Invalid approval decision'; end if;
  insert into public.approvals (shipment_id, approver_id, decision, reason) values ($1, auth.uid(), $2, $3);
  if $2 = 'approved' then
    update public.shipments set status = 'Approved', approved_by = auth.uid(), approved_at = now(), approval_reason = $3 where id = $1;
  else
    update public.shipments set status = 'Needs review', approved_by = null, approved_at = null, approval_reason = $3 where id = $1;
  end if;
end;
$$;

create or replace function public.shipment_export(p_shipment_id uuid)
returns void language plpgsql security definer
set search_path = pg_catalog, public, auth
as $$
declare caller text; cur_status text;
begin
  caller := public.current_app_role();
  if caller <> 'documentation_manager' then raise exception 'Only documentation_manager can export shipments'; end if;
  select s.status into cur_status from public.shipments s where s.id = $1 for update;
  if cur_status is null then raise exception 'Shipment not found'; end if;
  if cur_status <> 'Approved' then raise exception 'Shipment must be Approved before export (current: %)', cur_status; end if;
  if exists (select 1 from public.fields f where f.shipment_id = $1 and f.status = 'needs_review') then raise exception 'Cannot export: fields still need review'; end if;
  if exists (select 1 from public.crosscheck_results c where c.shipment_id = $1 and (c.status = 'cannot_check' or (c.status = 'fail' and (c.resolved_by is null or c.resolved_at is null or nullif(btrim(c.resolution_note), '') is null)))) then raise exception 'Cannot export: unresolved cross-check(s)'; end if;
  insert into public.exports (shipment_id, exported_by) values ($1, auth.uid());
  update public.shipments set status = 'Exported', exported_at = now() where id = $1;
end;
$$;

-- Return the exported CSV input from the same locked transaction that records
-- the export, so the file cannot be built from a different database snapshot.
create or replace function public.shipment_export_snapshot(p_shipment_id uuid)
returns jsonb language plpgsql security definer
set search_path = pg_catalog, public, auth
as $$
declare
  v_shipment public.shipments%rowtype;
  v_supplier text;
  v_fields jsonb;
begin
  if public.current_app_role() <> 'documentation_manager' then
    raise exception 'Only documentation_manager can export shipments';
  end if;
  select s.* into v_shipment from public.shipments s where s.id = p_shipment_id for update;
  if not found then raise exception 'Shipment not found'; end if;
  if v_shipment.status <> 'Approved' then raise exception 'Shipment must be Approved before export'; end if;
  if exists (select 1 from public.fields f where f.shipment_id = p_shipment_id and f.status = 'needs_review') then
    raise exception 'Cannot export: fields still need review';
  end if;
  if exists (select 1 from public.crosscheck_results c where c.shipment_id = p_shipment_id and (c.status = 'cannot_check' or (c.status = 'fail' and (c.resolved_by is null or c.resolved_at is null or nullif(btrim(c.resolution_note), '') is null)))) then
    raise exception 'Cannot export: unresolved cross-check(s)';
  end if;
  select s.name into v_supplier from public.suppliers s where s.id = v_shipment.supplier_id;
  select coalesce(jsonb_object_agg(f.key, f.value), '{}'::jsonb) into v_fields
    from public.fields f where f.shipment_id = p_shipment_id and f.key in ('consignee','invoice_total');
  insert into public.exports (shipment_id, exported_by, file_path)
    values (p_shipment_id, auth.uid(), 'export_' || v_shipment.shipment_number || '.csv');
  update public.shipments set status = 'Exported', exported_at = now() where id = p_shipment_id;
  return jsonb_build_object(
    'shipment', to_jsonb(v_shipment) || jsonb_build_object('suppliers', jsonb_build_object('name', v_supplier)),
    'fields', v_fields
  );
end;
$$;

revoke all on function public.shipment_approve(uuid, text, text) from public, anon;
revoke all on function public.shipment_export(uuid) from public, anon;
revoke all on function public.shipment_export_snapshot(uuid) from public, anon;
grant execute on function public.shipment_approve(uuid, text, text) to authenticated;
grant execute on function public.shipment_export(uuid) to authenticated;
grant execute on function public.shipment_export_snapshot(uuid) to authenticated;

revoke all on function public.lock_shipment_for_source_change() from public, anon, authenticated;

commit;

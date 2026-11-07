-- database/tests.sql
--
-- Security tests for the customs-doc-check schema.
-- Run these against a local Supabase/Postgres instance with RLS enabled.
--
-- Each block shows what a given role CANNOT do, verifying that server-side
-- role checks and RLS protect the data model. Expected failures are marked
-- with -- EXPECT: <error>.
--
-- To run: psql -f database/tests.sql (after applying database/schema.sql
-- and seeding profiles/roles).

\set ON_ERROR_STOP off

-- ---------------------------------------------------------------------------
-- Helper: create a test executive and manager profile (assumes Auth users
-- already exist with ids 'exec-id' and 'manager-id').
-- ---------------------------------------------------------------------------

INSERT INTO public.profiles (id, role, full_name, email)
VALUES
  ('exec-id',  'documentation_executive', 'Test Executive',  'exec@demo.local'),
  ('manager-id', 'documentation_manager', 'Test Manager', 'manager@demo.local')
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;

INSERT INTO public.suppliers (name, country)
VALUES ('Test Supplier', 'China')
ON CONFLICT (name) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 1. Executive cannot set shipment status to Approved directly.
-- ---------------------------------------------------------------------------

BEGIN;
SET ROLE exec-id;
-- An executive can update their own shipment status to Draft/Extracting/etc.
UPDATE public.shipments
SET status = 'Extracting'
WHERE id = '00000000-0000-0000-0000-000000000000' AND created_by = 'exec-id';
-- But setting to 'Approved' should be blocked by RLS (executive has no
-- update policy for Approved, and the security-definer approve function is
-- manager-only).
UPDATE public.shipments
SET status = 'Approved'
WHERE id = '00000000-0000-0000-0000-000000000000' AND created_by = 'exec-id';
-- EXPECT: violates row-level security policy for table "shipments"
ROLLBACK;

-- ---------------------------------------------------------------------------
-- 2. Executive cannot call the shipment_approve security-definer function.
-- ---------------------------------------------------------------------------

BEGIN;
SET ROLE exec-id;
SELECT public.shipment_approve(
  '00000000-0000-0000-0000-000000000000',
  'approved',
  'test approval'
);
-- EXPECT: Only documentation_manager can approve/reject shipments
ROLLBACK;

-- ---------------------------------------------------------------------------
-- 3. Executive cannot call the shipment_export security-definer function.
-- ---------------------------------------------------------------------------

BEGIN;
SET ROLE exec-id;
SELECT public.shipment_export('00000000-0000-0000-0000-000000000000');
-- EXPECT: Only documentation_manager can export shipments
ROLLBACK;

-- ---------------------------------------------------------------------------
-- 4. Manager can approve and export (positive control).
-- ---------------------------------------------------------------------------

BEGIN;
SET ROLE manager-id;
-- Insert a shipment ready for approval.
INSERT INTO public.shipments (shipment_number, supplier_id, status, created_by)
VALUES ('SHP-TEST', (SELECT id FROM public.suppliers LIMIT 1), 'Ready for approval', 'exec-id')
RETURNING id;
-- Manager approves.
SELECT public.shipment_approve(
  (SELECT id FROM public.shipments WHERE shipment_number = 'SHP-TEST'),
  'approved',
  'All checks pass'
);
-- Manager exports.
SELECT public.shipment_export(
  (SELECT id FROM public.shipments WHERE shipment_number = 'SHP-TEST')
);
ROLLBACK;

-- ---------------------------------------------------------------------------
-- 5. field_edits is insert-only: UPDATE and DELETE are blocked for all roles.
-- ---------------------------------------------------------------------------

BEGIN;
SET ROLE exec-id;
UPDATE public.field_edits
SET new_value = 'tampered'
WHERE id = '00000000-0000-0000-0000-000000000000';
-- EXPECT: cannot update table field_edits (no UPDATE policy)
ROLLBACK;

BEGIN;
SET ROLE exec-id;
DELETE FROM public.field_edits
WHERE id = '00000000-0000-0000-0000-000000000000';
-- EXPECT: cannot delete from table field_edits (no DELETE policy)
ROLLBACK;

BEGIN;
SET ROLE manager-id;
UPDATE public.field_edits
SET new_value = 'tampered-by-manager'
WHERE id = '00000000-0000-0000-0000-000000000000';
-- EXPECT: cannot update table field_edits (no UPDATE policy, even for manager)
ROLLBACK;

-- ---------------------------------------------------------------------------
-- 6. field_edits INSERT is allowed for executives (audit trail).
-- ---------------------------------------------------------------------------

BEGIN;
SET ROLE exec-id;
INSERT INTO public.field_edits (
  shipment_id, field_key, document_id, old_value, new_value,
  action, user_id, supplier_id
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'gross_weight_kg',
  '00000000-0000-0000-0000-000000000000',
  '3120',
  '3165',
  'edit',
  'exec-id',
  (SELECT id FROM public.suppliers LIMIT 1)
);
-- Should succeed (no error).
ROLLBACK;

-- ---------------------------------------------------------------------------
-- 7. Reset role.
-- ---------------------------------------------------------------------------
RESET ROLE;

\echo 'database/tests.sql completed'

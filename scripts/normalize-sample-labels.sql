-- Only normalize sample display values; preserve accounts, external IDs and immutable audit.
-- Safe to rerun: updates only values that still carry the old prefix.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

DO $guard$
BEGIN
  IF current_database() <> 'neondb' THEN
    RAISE EXCEPTION 'Expected database neondb';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.vehicles source JOIN public.vehicles target
      ON target.id <> source.id AND target.license_plate =
        regexp_replace(source.license_plate, '^SEED-([0-9]{2}[A-Z])-([0-9]{2})([0-9]{2})$', '\1-0\2.\3')
    WHERE source.license_plate LIKE 'SEED-%'
  ) THEN
    RAISE EXCEPTION 'Normalized license plate already exists';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.customers source JOIN public.customers target
      ON target.id <> source.id AND target.license_number = '079026' || lpad(source.id::text, 6, '0')
    WHERE source.license_number LIKE 'SEED-CUST-%'
  ) OR EXISTS (
    SELECT 1 FROM public.staffs source JOIN public.staffs target
      ON target.id <> source.id AND target.license_number = '079025' || lpad(source.id::text, 6, '0')
    WHERE source.license_number LIKE 'SEED-GPLX-%'
  ) THEN
    RAISE EXCEPTION 'Normalized license number already exists';
  END IF;
END;
$guard$;

CREATE TEMP TABLE label_cleanup_results (table_name text, changed_rows bigint) ON COMMIT DROP;

WITH changed AS (
  UPDATE public.geofences
  SET name = regexp_replace(name, '^\[seed\][[:space:]]*', '', 'i')
  WHERE name ILIKE '[seed]%'
  RETURNING id
)
INSERT INTO label_cleanup_results SELECT 'geofences', count(*) FROM changed;

WITH changed AS (
  UPDATE public.customers
  SET license_number = '079026' || lpad(id::text, 6, '0')
  WHERE license_number LIKE 'SEED-CUST-%'
  RETURNING id
)
INSERT INTO label_cleanup_results SELECT 'customers', count(*) FROM changed;

WITH changed AS (
  UPDATE public.staffs
  SET license_number = '079025' || lpad(id::text, 6, '0')
  WHERE license_number LIKE 'SEED-GPLX-%'
  RETURNING id
)
INSERT INTO label_cleanup_results SELECT 'staffs', count(*) FROM changed;

WITH changed AS (
  UPDATE public.invoices
  SET invoice_number = regexp_replace(invoice_number, '^SEED-', '')
  WHERE invoice_number LIKE 'SEED-INV-%'
  RETURNING id
)
INSERT INTO label_cleanup_results SELECT 'invoices', count(*) FROM changed;

WITH changed AS (
  UPDATE public.vehicles
  SET description = regexp_replace(description, '^\[seed\][[:space:]]*', '', 'i'),
    license_plate = regexp_replace(license_plate, '^SEED-([0-9]{2}[A-Z])-([0-9]{2})([0-9]{2})$', '\1-0\2.\3')
  WHERE description ILIKE '[seed]%' OR license_plate LIKE 'SEED-%'
  RETURNING id
)
INSERT INTO label_cleanup_results SELECT 'vehicles', count(*) FROM changed;

WITH changed AS (
  UPDATE public.reports
  SET description = regexp_replace(description, '^\[seed\][[:space:]]*', '', 'i')
  WHERE description ILIKE '[seed]%'
  RETURNING id
)
INSERT INTO label_cleanup_results SELECT 'reports', count(*) FROM changed;

WITH changed AS (
  UPDATE public.staff_ratings
  SET comment = regexp_replace(comment, '^\[seed\][[:space:]]*', '', 'i')
  WHERE comment ILIKE '[seed]%'
  RETURNING id
)
INSERT INTO label_cleanup_results SELECT 'staff_ratings', count(*) FROM changed;

WITH changed AS (
  UPDATE public.tracking_alerts
  SET message = regexp_replace(message, '^\[seed\][[:space:]]*', '', 'i')
  WHERE message ILIKE '[seed]%'
  RETURNING id
)
INSERT INTO label_cleanup_results SELECT 'tracking_alerts', count(*) FROM changed;

WITH changed AS (
  UPDATE public.tracking_devices
  SET name = regexp_replace(name, '^\[seed\][[:space:]]*', '', 'i')
  WHERE name ILIKE '[seed]%'
  RETURNING id
)
INSERT INTO label_cleanup_results SELECT 'tracking_devices', count(*) FROM changed;

WITH changed AS (
  UPDATE public.vehicle_last_positions
  SET address = regexp_replace(address, '^\[seed\][[:space:]]*', '', 'i')
  WHERE address ILIKE '[seed]%'
  RETURNING vehicle_id
)
INSERT INTO label_cleanup_results SELECT 'vehicle_last_positions', count(*) FROM changed;

WITH changed AS (
  UPDATE public.vehicle_maintenance
  SET description = regexp_replace(description, '^\[seed\][[:space:]]*', '', 'i')
  WHERE description ILIKE '[seed]%'
  RETURNING id
)
INSERT INTO label_cleanup_results SELECT 'vehicle_maintenance', count(*) FROM changed;

WITH changed AS (
  UPDATE public.vehicle_assignments
  SET note = regexp_replace(note, '^\[seed\][[:space:]]*', '', 'i')
  WHERE note ILIKE '[seed]%'
  RETURNING id
)
INSERT INTO label_cleanup_results SELECT 'vehicle_assignments', count(*) FROM changed;

DO $verify$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.geofences WHERE name ILIKE '%[seed]%'
    UNION ALL SELECT 1 FROM public.vehicles WHERE description ILIKE '%[seed]%' OR license_plate LIKE 'SEED-%'
    UNION ALL SELECT 1 FROM public.customers WHERE license_number LIKE 'SEED-CUST-%'
    UNION ALL SELECT 1 FROM public.staffs WHERE license_number LIKE 'SEED-GPLX-%'
    UNION ALL SELECT 1 FROM public.invoices WHERE invoice_number LIKE 'SEED-INV-%'
    UNION ALL SELECT 1 FROM public.reports WHERE description ILIKE '%[seed]%'
    UNION ALL SELECT 1 FROM public.staff_ratings WHERE comment ILIKE '%[seed]%'
    UNION ALL SELECT 1 FROM public.tracking_alerts WHERE message ILIKE '%[seed]%'
    UNION ALL SELECT 1 FROM public.tracking_devices WHERE name ILIKE '%[seed]%'
    UNION ALL SELECT 1 FROM public.vehicle_last_positions WHERE address ILIKE '%[seed]%'
    UNION ALL SELECT 1 FROM public.vehicle_maintenance WHERE description ILIKE '%[seed]%'
    UNION ALL SELECT 1 FROM public.vehicle_assignments WHERE note ILIKE '%[seed]%'
  ) THEN
    RAISE EXCEPTION 'Sample display labels remain; rolling back';
  END IF;
END;
$verify$;

SELECT table_name, changed_rows FROM label_cleanup_results ORDER BY table_name;
COMMIT;

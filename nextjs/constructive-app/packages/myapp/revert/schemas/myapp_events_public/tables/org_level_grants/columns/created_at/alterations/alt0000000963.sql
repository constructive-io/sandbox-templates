-- Revert: schemas/myapp_events_public/tables/org_level_grants/columns/created_at/alterations/alt0000000963


ALTER TABLE myapp_events_public.org_level_grants 
  ALTER COLUMN created_at DROP DEFAULT;



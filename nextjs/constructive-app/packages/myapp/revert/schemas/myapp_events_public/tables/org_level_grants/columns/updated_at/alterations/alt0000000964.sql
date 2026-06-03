-- Revert: schemas/myapp_events_public/tables/org_level_grants/columns/updated_at/alterations/alt0000000964


ALTER TABLE myapp_events_public.org_level_grants 
  ALTER COLUMN updated_at DROP DEFAULT;



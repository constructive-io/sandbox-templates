-- Revert: schemas/myapp_events_public/tables/org_level_grants/columns/id/alterations/alt0000000987


ALTER TABLE myapp_events_public.org_level_grants 
  ALTER COLUMN id DROP DEFAULT;



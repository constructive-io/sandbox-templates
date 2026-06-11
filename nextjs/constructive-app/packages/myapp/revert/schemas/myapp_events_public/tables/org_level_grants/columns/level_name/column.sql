-- Revert: schemas/myapp_events_public/tables/org_level_grants/columns/level_name/column


ALTER TABLE myapp_events_public.org_level_grants 
  DROP COLUMN level_name RESTRICT;



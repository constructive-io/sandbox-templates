-- Revert: schemas/myapp_events_public/tables/org_level_requirements/columns/created_at/alterations/alt0000000982


ALTER TABLE myapp_events_public.org_level_requirements 
  ALTER COLUMN created_at DROP DEFAULT;



-- Revert: schemas/myapp_events_public/tables/org_level_requirements/columns/updated_at/alterations/alt0000000950


ALTER TABLE myapp_events_public.org_level_requirements 
  ALTER COLUMN updated_at DROP DEFAULT;



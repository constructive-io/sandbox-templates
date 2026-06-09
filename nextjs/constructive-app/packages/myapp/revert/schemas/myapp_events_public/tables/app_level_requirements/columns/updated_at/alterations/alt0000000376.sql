-- Revert: schemas/myapp_events_public/tables/app_level_requirements/columns/updated_at/alterations/alt0000000376


ALTER TABLE myapp_events_public.app_level_requirements 
  ALTER COLUMN updated_at DROP DEFAULT;



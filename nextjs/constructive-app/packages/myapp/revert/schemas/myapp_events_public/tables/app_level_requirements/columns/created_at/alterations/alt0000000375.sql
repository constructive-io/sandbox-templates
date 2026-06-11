-- Revert: schemas/myapp_events_public/tables/app_level_requirements/columns/created_at/alterations/alt0000000375


ALTER TABLE myapp_events_public.app_level_requirements 
  ALTER COLUMN created_at DROP DEFAULT;



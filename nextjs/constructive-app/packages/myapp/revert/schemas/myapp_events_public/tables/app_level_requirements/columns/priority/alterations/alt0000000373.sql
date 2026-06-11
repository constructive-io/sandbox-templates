-- Revert: schemas/myapp_events_public/tables/app_level_requirements/columns/priority/alterations/alt0000000373


ALTER TABLE myapp_events_public.app_level_requirements 
  ALTER COLUMN priority DROP DEFAULT;



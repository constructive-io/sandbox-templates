-- Revert: schemas/myapp_events_public/tables/app_level_requirements/columns/name/alterations/alt0000000364


ALTER TABLE myapp_events_public.app_level_requirements 
  ALTER COLUMN name DROP NOT NULL;



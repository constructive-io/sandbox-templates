-- Revert: schemas/myapp_events_public/tables/app_level_requirements/columns/level/alterations/alt0000000349


ALTER TABLE myapp_events_public.app_level_requirements 
  ALTER COLUMN level DROP NOT NULL;



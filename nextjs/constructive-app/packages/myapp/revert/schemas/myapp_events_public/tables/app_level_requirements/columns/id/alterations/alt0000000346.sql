-- Revert: schemas/myapp_events_public/tables/app_level_requirements/columns/id/alterations/alt0000000346


ALTER TABLE myapp_events_public.app_level_requirements 
  ALTER COLUMN id DROP DEFAULT;



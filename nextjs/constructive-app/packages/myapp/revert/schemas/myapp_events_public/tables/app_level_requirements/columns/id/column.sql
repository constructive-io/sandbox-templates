-- Revert: schemas/myapp_events_public/tables/app_level_requirements/columns/id/column


ALTER TABLE myapp_events_public.app_level_requirements 
  DROP COLUMN id RESTRICT;



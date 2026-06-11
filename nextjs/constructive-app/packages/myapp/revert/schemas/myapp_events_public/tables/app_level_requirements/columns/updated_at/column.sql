-- Revert: schemas/myapp_events_public/tables/app_level_requirements/columns/updated_at/column


ALTER TABLE myapp_events_public.app_level_requirements 
  DROP COLUMN updated_at RESTRICT;



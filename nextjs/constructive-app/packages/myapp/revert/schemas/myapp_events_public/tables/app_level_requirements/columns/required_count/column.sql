-- Revert: schemas/myapp_events_public/tables/app_level_requirements/columns/required_count/column


ALTER TABLE myapp_events_public.app_level_requirements 
  DROP COLUMN required_count RESTRICT;



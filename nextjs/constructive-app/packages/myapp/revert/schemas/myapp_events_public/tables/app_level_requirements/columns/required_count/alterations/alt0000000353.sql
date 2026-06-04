-- Revert: schemas/myapp_events_public/tables/app_level_requirements/columns/required_count/alterations/alt0000000353


ALTER TABLE myapp_events_public.app_level_requirements 
  ALTER COLUMN required_count DROP DEFAULT;



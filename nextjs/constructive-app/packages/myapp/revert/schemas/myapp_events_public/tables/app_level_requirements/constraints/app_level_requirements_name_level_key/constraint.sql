-- Revert: schemas/myapp_events_public/tables/app_level_requirements/constraints/app_level_requirements_name_level_key/constraint


ALTER TABLE myapp_events_public.app_level_requirements 
  DROP CONSTRAINT app_level_requirements_name_level_key;



-- Revert: schemas/myapp_events_public/tables/org_level_requirements/columns/required_count/alterations/alt0000000976


ALTER TABLE myapp_events_public.org_level_requirements 
  ALTER COLUMN required_count DROP DEFAULT;



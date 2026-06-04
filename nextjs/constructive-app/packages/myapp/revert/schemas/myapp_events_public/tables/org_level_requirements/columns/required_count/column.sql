-- Revert: schemas/myapp_events_public/tables/org_level_requirements/columns/required_count/column


ALTER TABLE myapp_events_public.org_level_requirements 
  DROP COLUMN required_count RESTRICT;



-- Revert: schemas/myapp_events_public/tables/org_level_requirements/columns/level/column


ALTER TABLE myapp_events_public.org_level_requirements 
  DROP COLUMN level RESTRICT;



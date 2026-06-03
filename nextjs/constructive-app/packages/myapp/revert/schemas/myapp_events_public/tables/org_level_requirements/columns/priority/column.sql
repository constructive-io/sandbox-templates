-- Revert: schemas/myapp_events_public/tables/org_level_requirements/columns/priority/column


ALTER TABLE myapp_events_public.org_level_requirements 
  DROP COLUMN priority RESTRICT;



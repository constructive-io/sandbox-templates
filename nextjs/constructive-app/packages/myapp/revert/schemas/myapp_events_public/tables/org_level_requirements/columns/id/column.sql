-- Revert: schemas/myapp_events_public/tables/org_level_requirements/columns/id/column


ALTER TABLE myapp_events_public.org_level_requirements 
  DROP COLUMN id RESTRICT;



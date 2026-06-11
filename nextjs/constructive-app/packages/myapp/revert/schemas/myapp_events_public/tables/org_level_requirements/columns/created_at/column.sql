-- Revert: schemas/myapp_events_public/tables/org_level_requirements/columns/created_at/column


ALTER TABLE myapp_events_public.org_level_requirements 
  DROP COLUMN created_at RESTRICT;



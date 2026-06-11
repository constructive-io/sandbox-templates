-- Revert: schemas/myapp_events_public/tables/org_level_requirements/columns/entity_id/column


ALTER TABLE myapp_events_public.org_level_requirements 
  DROP COLUMN entity_id RESTRICT;



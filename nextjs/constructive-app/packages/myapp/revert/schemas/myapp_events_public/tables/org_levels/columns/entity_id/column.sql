-- Revert: schemas/myapp_events_public/tables/org_levels/columns/entity_id/column


ALTER TABLE myapp_events_public.org_levels 
  DROP COLUMN entity_id RESTRICT;



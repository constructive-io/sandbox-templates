-- Revert: schemas/myapp_events_public/tables/org_level_grants/columns/entity_id/column


ALTER TABLE myapp_events_public.org_level_grants 
  DROP COLUMN entity_id RESTRICT;



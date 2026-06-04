-- Revert: schemas/myapp_events_public/tables/org_events/columns/entity_type/column


ALTER TABLE myapp_events_public.org_events 
  DROP COLUMN entity_type RESTRICT;



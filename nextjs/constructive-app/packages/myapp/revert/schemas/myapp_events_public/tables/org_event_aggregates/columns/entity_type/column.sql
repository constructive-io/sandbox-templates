-- Revert: schemas/myapp_events_public/tables/org_event_aggregates/columns/entity_type/column


ALTER TABLE myapp_events_public.org_event_aggregates 
  DROP COLUMN entity_type RESTRICT;



-- Revert: schemas/myapp_events_public/tables/org_event_aggregates/columns/count/column


ALTER TABLE myapp_events_public.org_event_aggregates 
  DROP COLUMN count RESTRICT;



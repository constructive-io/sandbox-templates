-- Revert: schemas/myapp_events_public/tables/org_event_aggregates/columns/id/column


ALTER TABLE myapp_events_public.org_event_aggregates 
  DROP COLUMN id RESTRICT;



-- Revert: schemas/myapp_events_public/tables/org_event_aggregates/columns/period_start/column


ALTER TABLE myapp_events_public.org_event_aggregates 
  DROP COLUMN period_start RESTRICT;



-- Revert: schemas/myapp_events_public/tables/app_event_aggregates/columns/period_start/column


ALTER TABLE myapp_events_public.app_event_aggregates 
  DROP COLUMN period_start RESTRICT;



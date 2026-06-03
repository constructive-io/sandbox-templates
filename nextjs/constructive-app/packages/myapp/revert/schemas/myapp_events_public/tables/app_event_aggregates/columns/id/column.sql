-- Revert: schemas/myapp_events_public/tables/app_event_aggregates/columns/id/column


ALTER TABLE myapp_events_public.app_event_aggregates 
  DROP COLUMN id RESTRICT;



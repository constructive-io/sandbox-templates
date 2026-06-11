-- Revert: schemas/myapp_events_public/tables/app_event_aggregates/columns/created_at/column


ALTER TABLE myapp_events_public.app_event_aggregates 
  DROP COLUMN created_at RESTRICT;



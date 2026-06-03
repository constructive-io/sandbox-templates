-- Revert: schemas/myapp_events_public/tables/app_event_aggregates/columns/updated_at/column


ALTER TABLE myapp_events_public.app_event_aggregates 
  DROP COLUMN updated_at RESTRICT;



-- Revert: schemas/myapp_events_public/tables/app_event_aggregates/columns/updated_at/alterations/alt0000000307


ALTER TABLE myapp_events_public.app_event_aggregates 
  ALTER COLUMN updated_at DROP DEFAULT;



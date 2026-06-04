-- Revert: schemas/myapp_events_public/tables/app_event_aggregates/columns/count/alterations/alt0000000303


ALTER TABLE myapp_events_public.app_event_aggregates 
  ALTER COLUMN count DROP DEFAULT;



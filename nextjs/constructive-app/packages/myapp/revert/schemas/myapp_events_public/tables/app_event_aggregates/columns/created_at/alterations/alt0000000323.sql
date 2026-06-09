-- Revert: schemas/myapp_events_public/tables/app_event_aggregates/columns/created_at/alterations/alt0000000323


ALTER TABLE myapp_events_public.app_event_aggregates 
  ALTER COLUMN created_at DROP DEFAULT;



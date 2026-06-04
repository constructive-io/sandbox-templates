-- Revert: schemas/myapp_events_public/tables/app_event_aggregates/columns/id/alterations/alt0000000297


ALTER TABLE myapp_events_public.app_event_aggregates 
  ALTER COLUMN id DROP DEFAULT;



-- Revert: schemas/myapp_events_public/tables/app_event_types/columns/aggregation/alterations/alt0000000334


ALTER TABLE myapp_events_public.app_event_types 
  ALTER COLUMN aggregation DROP DEFAULT;



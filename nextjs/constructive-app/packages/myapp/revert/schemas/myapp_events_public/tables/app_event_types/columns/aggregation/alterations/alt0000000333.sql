-- Revert: schemas/myapp_events_public/tables/app_event_types/columns/aggregation/alterations/alt0000000333


ALTER TABLE myapp_events_public.app_event_types 
  ALTER COLUMN aggregation DROP NOT NULL;



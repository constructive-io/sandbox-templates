-- Revert: schemas/myapp_events_public/tables/app_event_aggregates/columns/name/alterations/alt0000000317


ALTER TABLE myapp_events_public.app_event_aggregates 
  ALTER COLUMN name DROP NOT NULL;



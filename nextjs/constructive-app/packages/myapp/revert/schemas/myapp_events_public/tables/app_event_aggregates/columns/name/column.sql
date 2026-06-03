-- Revert: schemas/myapp_events_public/tables/app_event_aggregates/columns/name/column


ALTER TABLE myapp_events_public.app_event_aggregates 
  DROP COLUMN name RESTRICT;



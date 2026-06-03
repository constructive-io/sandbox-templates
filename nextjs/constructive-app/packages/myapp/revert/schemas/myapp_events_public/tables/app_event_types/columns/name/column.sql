-- Revert: schemas/myapp_events_public/tables/app_event_types/columns/name/column


ALTER TABLE myapp_events_public.app_event_types 
  DROP COLUMN name RESTRICT;



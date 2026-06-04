-- Revert: schemas/myapp_events_public/tables/app_events/columns/name/column


ALTER TABLE myapp_events_public.app_events 
  DROP COLUMN name RESTRICT;



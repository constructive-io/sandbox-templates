-- Revert: schemas/myapp_events_public/tables/app_events/columns/name/alterations/alt0000000306


ALTER TABLE myapp_events_public.app_events 
  ALTER COLUMN name DROP NOT NULL;



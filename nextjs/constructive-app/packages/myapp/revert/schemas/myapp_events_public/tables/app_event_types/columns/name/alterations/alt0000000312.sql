-- Revert: schemas/myapp_events_public/tables/app_event_types/columns/name/alterations/alt0000000312


ALTER TABLE myapp_events_public.app_event_types 
  ALTER COLUMN name DROP NOT NULL;



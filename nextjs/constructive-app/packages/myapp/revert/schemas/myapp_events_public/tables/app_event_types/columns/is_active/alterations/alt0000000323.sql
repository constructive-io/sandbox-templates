-- Revert: schemas/myapp_events_public/tables/app_event_types/columns/is_active/alterations/alt0000000323


ALTER TABLE myapp_events_public.app_event_types 
  ALTER COLUMN is_active DROP NOT NULL;



-- Revert: schemas/myapp_events_public/tables/app_event_types/columns/is_milestone/alterations/alt0000000337


ALTER TABLE myapp_events_public.app_event_types 
  ALTER COLUMN is_milestone DROP NOT NULL;



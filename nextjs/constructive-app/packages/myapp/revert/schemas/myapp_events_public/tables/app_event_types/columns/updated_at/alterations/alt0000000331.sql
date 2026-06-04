-- Revert: schemas/myapp_events_public/tables/app_event_types/columns/updated_at/alterations/alt0000000331


ALTER TABLE myapp_events_public.app_event_types 
  ALTER COLUMN updated_at DROP DEFAULT;



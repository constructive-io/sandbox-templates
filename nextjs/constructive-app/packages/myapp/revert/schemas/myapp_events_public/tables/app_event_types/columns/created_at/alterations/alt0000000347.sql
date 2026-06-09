-- Revert: schemas/myapp_events_public/tables/app_event_types/columns/created_at/alterations/alt0000000347


ALTER TABLE myapp_events_public.app_event_types 
  ALTER COLUMN created_at DROP DEFAULT;



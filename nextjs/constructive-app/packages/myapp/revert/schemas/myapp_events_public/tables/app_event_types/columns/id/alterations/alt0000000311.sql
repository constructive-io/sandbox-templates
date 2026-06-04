-- Revert: schemas/myapp_events_public/tables/app_event_types/columns/id/alterations/alt0000000311


ALTER TABLE myapp_events_public.app_event_types 
  ALTER COLUMN id DROP DEFAULT;



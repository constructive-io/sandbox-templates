-- Revert: schemas/myapp_events_public/tables/app_event_types/columns/updated_at/column


ALTER TABLE myapp_events_public.app_event_types 
  DROP COLUMN updated_at RESTRICT;



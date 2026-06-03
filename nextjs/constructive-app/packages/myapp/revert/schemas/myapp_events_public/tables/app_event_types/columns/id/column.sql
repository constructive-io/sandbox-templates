-- Revert: schemas/myapp_events_public/tables/app_event_types/columns/id/column


ALTER TABLE myapp_events_public.app_event_types 
  DROP COLUMN id RESTRICT;



-- Revert: schemas/myapp_events_public/tables/app_event_types/columns/retention_days/column


ALTER TABLE myapp_events_public.app_event_types 
  DROP COLUMN retention_days RESTRICT;



-- Revert: schemas/myapp_events_public/tables/app_event_types/columns/feeds_levels/column


ALTER TABLE myapp_events_public.app_event_types 
  DROP COLUMN feeds_levels RESTRICT;



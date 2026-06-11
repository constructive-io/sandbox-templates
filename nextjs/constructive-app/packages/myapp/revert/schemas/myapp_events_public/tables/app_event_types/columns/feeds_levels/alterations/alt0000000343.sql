-- Revert: schemas/myapp_events_public/tables/app_event_types/columns/feeds_levels/alterations/alt0000000343


ALTER TABLE myapp_events_public.app_event_types 
  ALTER COLUMN feeds_levels DROP NOT NULL;



-- Deploy: schemas/myapp_events_public/tables/app_event_types/columns/feeds_levels/alterations/alt0000000326
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_event_types/table
-- requires: schemas/myapp_events_public/tables/app_event_types/columns/feeds_levels/column


ALTER TABLE myapp_events_public.app_event_types 
  ALTER COLUMN feeds_levels SET NOT NULL;


-- Deploy: schemas/myapp_events_public/tables/app_event_types/columns/feeds_levels/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_event_types/table


ALTER TABLE myapp_events_public.app_event_types 
  ADD COLUMN feeds_levels boolean;


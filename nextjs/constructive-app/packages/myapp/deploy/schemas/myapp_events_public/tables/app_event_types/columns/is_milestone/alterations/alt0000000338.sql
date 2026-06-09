-- Deploy: schemas/myapp_events_public/tables/app_event_types/columns/is_milestone/alterations/alt0000000338
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_event_types/table
-- requires: schemas/myapp_events_public/tables/app_event_types/columns/is_milestone/column


ALTER TABLE myapp_events_public.app_event_types 
  ALTER COLUMN is_milestone SET DEFAULT false;


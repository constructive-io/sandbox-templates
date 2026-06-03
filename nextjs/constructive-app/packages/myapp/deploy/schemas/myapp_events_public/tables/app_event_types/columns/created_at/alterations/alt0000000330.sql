-- Deploy: schemas/myapp_events_public/tables/app_event_types/columns/created_at/alterations/alt0000000330
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_event_types/table
-- requires: schemas/myapp_events_public/tables/app_event_types/columns/created_at/column


ALTER TABLE myapp_events_public.app_event_types 
  ALTER COLUMN created_at SET DEFAULT now();


-- Deploy: schemas/myapp_events_public/tables/app_event_types/columns/id/alterations/alt0000000328
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_event_types/table
-- requires: schemas/myapp_events_public/tables/app_event_types/columns/id/column


ALTER TABLE myapp_events_public.app_event_types 
  ALTER COLUMN id SET DEFAULT uuidv7();


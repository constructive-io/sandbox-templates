-- Deploy: schemas/myapp_events_public/tables/org_event_types/columns/id/alterations/alt0000000932
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_event_types/table
-- requires: schemas/myapp_events_public/tables/org_event_types/columns/id/column


ALTER TABLE myapp_events_public.org_event_types 
  ALTER COLUMN id SET DEFAULT uuidv7();


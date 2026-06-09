-- Deploy: schemas/myapp_events_public/tables/org_events/columns/id/alterations/alt0000000899
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_events/table
-- requires: schemas/myapp_events_public/tables/org_events/columns/id/column


ALTER TABLE myapp_events_public.org_events 
  ALTER COLUMN id SET NOT NULL;


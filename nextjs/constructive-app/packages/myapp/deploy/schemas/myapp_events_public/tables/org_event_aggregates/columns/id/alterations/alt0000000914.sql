-- Deploy: schemas/myapp_events_public/tables/org_event_aggregates/columns/id/alterations/alt0000000914
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_event_aggregates/table
-- requires: schemas/myapp_events_public/tables/org_event_aggregates/columns/id/column


ALTER TABLE myapp_events_public.org_event_aggregates 
  ALTER COLUMN id SET NOT NULL;


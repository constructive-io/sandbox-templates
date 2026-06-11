-- Deploy: schemas/myapp_events_public/tables/org_event_aggregates/columns/name/alterations/alt0000000918
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_event_aggregates/table
-- requires: schemas/myapp_events_public/tables/org_event_aggregates/columns/name/column


ALTER TABLE myapp_events_public.org_event_aggregates 
  ALTER COLUMN name SET NOT NULL;


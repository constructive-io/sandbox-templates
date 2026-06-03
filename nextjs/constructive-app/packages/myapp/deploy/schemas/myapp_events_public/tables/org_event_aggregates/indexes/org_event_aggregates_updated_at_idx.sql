-- Deploy: schemas/myapp_events_public/tables/org_event_aggregates/indexes/org_event_aggregates_updated_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_event_aggregates/table
-- requires: schemas/myapp_events_public/tables/org_event_aggregates/columns/updated_at/column


CREATE INDEX org_event_aggregates_updated_at_idx ON myapp_events_public.org_event_aggregates ( updated_at );


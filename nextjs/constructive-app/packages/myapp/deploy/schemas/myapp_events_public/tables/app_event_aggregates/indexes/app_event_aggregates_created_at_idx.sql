-- Deploy: schemas/myapp_events_public/tables/app_event_aggregates/indexes/app_event_aggregates_created_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_event_aggregates/table
-- requires: schemas/myapp_events_public/tables/app_event_aggregates/columns/created_at/column


CREATE INDEX app_event_aggregates_created_at_idx ON myapp_events_public.app_event_aggregates ( created_at );


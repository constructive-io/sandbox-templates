-- Deploy: schemas/myapp_events_public/tables/app_event_types/indexes/app_event_types_updated_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_event_types/table
-- requires: schemas/myapp_events_public/tables/app_event_types/columns/updated_at/column


CREATE INDEX app_event_types_updated_at_idx ON myapp_events_public.app_event_types ( updated_at );


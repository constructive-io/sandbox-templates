-- Deploy: schemas/myapp_events_public/tables/org_event_types/columns/retention_days/alterations/alt0000000940
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_event_types/columns/retention_days/column


COMMENT ON COLUMN myapp_events_public.org_event_types.retention_days IS E'Per-type retention override in days; NULL uses module default; 0 means keep forever';


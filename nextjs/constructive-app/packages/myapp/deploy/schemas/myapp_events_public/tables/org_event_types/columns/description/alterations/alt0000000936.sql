-- Deploy: schemas/myapp_events_public/tables/org_event_types/columns/description/alterations/alt0000000936
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_event_types/columns/description/column


COMMENT ON COLUMN myapp_events_public.org_event_types.description IS E'Human-readable description of this event type';


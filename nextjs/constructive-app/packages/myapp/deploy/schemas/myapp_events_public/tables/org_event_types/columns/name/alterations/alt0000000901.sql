-- Deploy: schemas/myapp_events_public/tables/org_event_types/columns/name/alterations/alt0000000901
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_event_types/columns/name/column


COMMENT ON COLUMN myapp_events_public.org_event_types.name IS 'Unique name identifier for this event type';


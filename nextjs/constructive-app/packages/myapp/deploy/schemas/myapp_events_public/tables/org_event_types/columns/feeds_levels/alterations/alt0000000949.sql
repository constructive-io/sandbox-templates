-- Deploy: schemas/myapp_events_public/tables/org_event_types/columns/feeds_levels/alterations/alt0000000949
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_event_types/columns/feeds_levels/column


COMMENT ON COLUMN myapp_events_public.org_event_types.feeds_levels IS E'Whether this event type participates in the levels/badge system by updating aggregates';


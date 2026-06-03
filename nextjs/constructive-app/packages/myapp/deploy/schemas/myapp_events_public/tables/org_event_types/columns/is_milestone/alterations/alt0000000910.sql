-- Deploy: schemas/myapp_events_public/tables/org_event_types/columns/is_milestone/alterations/alt0000000910
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_event_types/columns/is_milestone/column


COMMENT ON COLUMN myapp_events_public.org_event_types.is_milestone IS 'Whether this event type is exempt from partition pruning regardless of retention';


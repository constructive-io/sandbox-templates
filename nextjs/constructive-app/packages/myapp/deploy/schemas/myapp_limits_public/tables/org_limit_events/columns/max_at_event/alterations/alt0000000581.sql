-- Deploy: schemas/myapp_limits_public/tables/org_limit_events/columns/max_at_event/alterations/alt0000000581
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_events/columns/max_at_event/column


COMMENT ON COLUMN myapp_limits_public.org_limit_events.max_at_event IS 'Max limit ceiling at the time of this event';


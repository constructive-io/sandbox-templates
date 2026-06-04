-- Deploy: schemas/myapp_limits_public/tables/org_limit_events/columns/event_type/alterations/alt0000000562
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_events/columns/event_type/column


COMMENT ON COLUMN myapp_limits_public.org_limit_events.event_type IS E'Event type: inc, dec, check, modify, transfer, apply_plan, reset';


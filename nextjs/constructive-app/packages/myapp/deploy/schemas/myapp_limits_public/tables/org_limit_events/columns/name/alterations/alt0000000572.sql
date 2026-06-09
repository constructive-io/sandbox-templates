-- Deploy: schemas/myapp_limits_public/tables/org_limit_events/columns/name/alterations/alt0000000572
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_events/columns/name/column


COMMENT ON COLUMN myapp_limits_public.org_limit_events.name IS 'Limit name this event applies to';


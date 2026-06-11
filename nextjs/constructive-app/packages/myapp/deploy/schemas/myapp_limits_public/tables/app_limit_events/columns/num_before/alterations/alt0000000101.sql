-- Deploy: schemas/myapp_limits_public/tables/app_limit_events/columns/num_before/alterations/alt0000000101
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_events/columns/num_before/column


COMMENT ON COLUMN myapp_limits_public.app_limit_events.num_before IS 'Usage count before this event';


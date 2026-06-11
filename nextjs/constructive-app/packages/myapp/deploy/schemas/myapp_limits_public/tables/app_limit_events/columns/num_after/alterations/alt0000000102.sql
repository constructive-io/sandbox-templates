-- Deploy: schemas/myapp_limits_public/tables/app_limit_events/columns/num_after/alterations/alt0000000102
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_events/columns/num_after/column


COMMENT ON COLUMN myapp_limits_public.app_limit_events.num_after IS 'Usage count after this event';


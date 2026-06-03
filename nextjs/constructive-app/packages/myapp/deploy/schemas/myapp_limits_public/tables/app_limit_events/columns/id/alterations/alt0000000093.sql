-- Deploy: schemas/myapp_limits_public/tables/app_limit_events/columns/id/alterations/alt0000000093
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_events/columns/id/column


COMMENT ON COLUMN myapp_limits_public.app_limit_events.id IS 'Unique identifier for each limit event';


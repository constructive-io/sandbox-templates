-- Deploy: schemas/myapp_limits_public/tables/app_limits/columns/window_start/alterations/alt0000000058
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limits/columns/window_start/column


COMMENT ON COLUMN myapp_limits_public.app_limits.window_start IS E'Start of the current metering window; NULL means no time window';


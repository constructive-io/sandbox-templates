-- Deploy: schemas/myapp_limits_public/tables/org_limits/columns/window_duration/alterations/alt0000000496
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limits/columns/window_duration/column


COMMENT ON COLUMN myapp_limits_public.org_limits.window_duration IS E'Duration of the metering window (e.g. 1 day, 1 month); NULL means no time window';


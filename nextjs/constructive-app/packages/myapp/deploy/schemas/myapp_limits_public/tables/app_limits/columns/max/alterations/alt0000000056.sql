-- Deploy: schemas/myapp_limits_public/tables/app_limits/columns/max/alterations/alt0000000056
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limits/columns/max/column


COMMENT ON COLUMN myapp_limits_public.app_limits.max IS E'Maximum allowed usage; negative means unlimited. Modified by plans, credits, and achievements.';


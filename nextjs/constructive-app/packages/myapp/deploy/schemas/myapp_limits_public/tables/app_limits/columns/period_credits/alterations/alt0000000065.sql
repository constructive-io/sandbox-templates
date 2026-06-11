-- Deploy: schemas/myapp_limits_public/tables/app_limits/columns/period_credits/alterations/alt0000000065
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limits/columns/period_credits/column


COMMENT ON COLUMN myapp_limits_public.app_limits.period_credits IS E'Temporary credits for the current billing window. Resets to 0 on window expiry.';


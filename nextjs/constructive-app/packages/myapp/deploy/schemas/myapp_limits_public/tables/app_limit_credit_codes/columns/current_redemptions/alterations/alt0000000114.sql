-- Deploy: schemas/myapp_limits_public/tables/app_limit_credit_codes/columns/current_redemptions/alterations/alt0000000114
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_codes/columns/current_redemptions/column


COMMENT ON COLUMN myapp_limits_public.app_limit_credit_codes.current_redemptions IS E'Current number of redemptions (incremented by trigger on credit_redemptions)';


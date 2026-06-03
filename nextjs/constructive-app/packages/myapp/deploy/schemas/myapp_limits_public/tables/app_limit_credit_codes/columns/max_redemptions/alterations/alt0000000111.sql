-- Deploy: schemas/myapp_limits_public/tables/app_limit_credit_codes/columns/max_redemptions/alterations/alt0000000111
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_codes/columns/max_redemptions/column


COMMENT ON COLUMN myapp_limits_public.app_limit_credit_codes.max_redemptions IS E'Maximum total redemptions allowed; NULL for unlimited';


-- Deploy: schemas/myapp_limits_public/tables/app_limit_credit_redemptions/columns/credit_code_id/alterations/alt0000000134
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_redemptions/columns/credit_code_id/column


COMMENT ON COLUMN myapp_limits_public.app_limit_credit_redemptions.credit_code_id IS E'FK to credit_codes — which code is being redeemed';


-- Deploy: schemas/myapp_limits_public/tables/app_limit_credits/columns/reason/alterations/alt0000000088
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_credits/columns/reason/column


COMMENT ON COLUMN myapp_limits_public.app_limit_credits.reason IS E'Optional reason for the credit grant (promo code, admin grant, etc.)';


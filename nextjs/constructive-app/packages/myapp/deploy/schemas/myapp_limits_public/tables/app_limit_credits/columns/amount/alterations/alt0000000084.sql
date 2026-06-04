-- Deploy: schemas/myapp_limits_public/tables/app_limit_credits/columns/amount/alterations/alt0000000084
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_credits/columns/amount/column


COMMENT ON COLUMN myapp_limits_public.app_limit_credits.amount IS E'Number of credits to grant (positive to add, negative to revoke)';


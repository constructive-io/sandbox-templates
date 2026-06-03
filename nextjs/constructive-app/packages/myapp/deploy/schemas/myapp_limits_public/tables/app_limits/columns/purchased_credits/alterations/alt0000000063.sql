-- Deploy: schemas/myapp_limits_public/tables/app_limits/columns/purchased_credits/alterations/alt0000000063
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limits/columns/purchased_credits/column


COMMENT ON COLUMN myapp_limits_public.app_limits.purchased_credits IS E'Permanent credits from purchases, admin grants, or lifetime rewards. Survives window reset.';


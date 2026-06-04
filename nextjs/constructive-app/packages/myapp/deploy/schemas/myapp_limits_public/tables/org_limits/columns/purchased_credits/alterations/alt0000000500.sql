-- Deploy: schemas/myapp_limits_public/tables/org_limits/columns/purchased_credits/alterations/alt0000000500
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limits/columns/purchased_credits/column


COMMENT ON COLUMN myapp_limits_public.org_limits.purchased_credits IS E'Permanent credits from purchases, admin grants, or lifetime rewards. Survives window reset.';


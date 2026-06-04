-- Deploy: schemas/myapp_limits_public/tables/org_limit_credits/columns/credit_type/alterations/alt0000000528
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_credits/columns/credit_type/column


COMMENT ON COLUMN myapp_limits_public.org_limit_credits.credit_type IS E'Credit durability: permanent (survives window reset) or period (resets on window expiry)';


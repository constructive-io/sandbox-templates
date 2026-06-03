-- Deploy: schemas/myapp_limits_public/tables/org_limit_aggregates/columns/purchased_credits/alterations/alt0000000544
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_aggregates/table
-- requires: schemas/myapp_limits_public/tables/org_limit_aggregates/columns/purchased_credits/column


ALTER TABLE myapp_limits_public.org_limit_aggregates 
  ALTER COLUMN purchased_credits SET DEFAULT 0;


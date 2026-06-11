-- Deploy: schemas/myapp_limits_public/tables/org_limits/columns/period_credits/alterations/alt0000000516
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limits/table
-- requires: schemas/myapp_limits_public/tables/org_limits/columns/period_credits/column


ALTER TABLE myapp_limits_public.org_limits 
  ALTER COLUMN period_credits SET DEFAULT 0;


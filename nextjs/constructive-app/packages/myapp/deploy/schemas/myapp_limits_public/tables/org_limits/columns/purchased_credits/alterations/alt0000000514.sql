-- Deploy: schemas/myapp_limits_public/tables/org_limits/columns/purchased_credits/alterations/alt0000000514
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limits/table
-- requires: schemas/myapp_limits_public/tables/org_limits/columns/purchased_credits/column


ALTER TABLE myapp_limits_public.org_limits 
  ALTER COLUMN purchased_credits SET DEFAULT 0;


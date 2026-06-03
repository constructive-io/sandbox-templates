-- Deploy: schemas/myapp_limits_public/tables/org_limit_credits/columns/credit_type/alterations/alt0000000527
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_credits/table
-- requires: schemas/myapp_limits_public/tables/org_limit_credits/columns/credit_type/column


ALTER TABLE myapp_limits_public.org_limit_credits 
  ALTER COLUMN credit_type SET DEFAULT 'permanent';


-- Deploy: schemas/myapp_limits_public/tables/org_limit_credits/columns/credit_type/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_credits/table


ALTER TABLE myapp_limits_public.org_limit_credits 
  ADD COLUMN credit_type text;


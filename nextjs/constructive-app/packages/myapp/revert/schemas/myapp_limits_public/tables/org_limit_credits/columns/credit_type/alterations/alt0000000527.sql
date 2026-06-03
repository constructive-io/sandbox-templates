-- Revert: schemas/myapp_limits_public/tables/org_limit_credits/columns/credit_type/alterations/alt0000000527


ALTER TABLE myapp_limits_public.org_limit_credits 
  ALTER COLUMN credit_type DROP DEFAULT;



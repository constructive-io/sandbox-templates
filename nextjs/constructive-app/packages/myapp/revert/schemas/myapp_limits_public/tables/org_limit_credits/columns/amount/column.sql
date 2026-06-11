-- Revert: schemas/myapp_limits_public/tables/org_limit_credits/columns/amount/column


ALTER TABLE myapp_limits_public.org_limit_credits 
  DROP COLUMN amount RESTRICT;



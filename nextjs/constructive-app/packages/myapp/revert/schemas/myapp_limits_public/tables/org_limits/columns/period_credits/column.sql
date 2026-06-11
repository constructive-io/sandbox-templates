-- Revert: schemas/myapp_limits_public/tables/org_limits/columns/period_credits/column


ALTER TABLE myapp_limits_public.org_limits 
  DROP COLUMN period_credits RESTRICT;



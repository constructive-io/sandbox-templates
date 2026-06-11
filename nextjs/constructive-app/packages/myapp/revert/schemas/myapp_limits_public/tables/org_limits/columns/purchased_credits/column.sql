-- Revert: schemas/myapp_limits_public/tables/org_limits/columns/purchased_credits/column


ALTER TABLE myapp_limits_public.org_limits 
  DROP COLUMN purchased_credits RESTRICT;



-- Revert: schemas/myapp_limits_public/tables/org_limit_aggregates/columns/purchased_credits/column


ALTER TABLE myapp_limits_public.org_limit_aggregates 
  DROP COLUMN purchased_credits RESTRICT;



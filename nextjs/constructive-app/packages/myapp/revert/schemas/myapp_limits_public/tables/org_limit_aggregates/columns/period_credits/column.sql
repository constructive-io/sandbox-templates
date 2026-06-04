-- Revert: schemas/myapp_limits_public/tables/org_limit_aggregates/columns/period_credits/column


ALTER TABLE myapp_limits_public.org_limit_aggregates 
  DROP COLUMN period_credits RESTRICT;



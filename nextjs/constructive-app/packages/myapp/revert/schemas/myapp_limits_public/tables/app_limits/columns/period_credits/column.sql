-- Revert: schemas/myapp_limits_public/tables/app_limits/columns/period_credits/column


ALTER TABLE myapp_limits_public.app_limits 
  DROP COLUMN period_credits RESTRICT;



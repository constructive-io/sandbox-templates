-- Revert: schemas/myapp_limits_public/tables/app_limits/columns/purchased_credits/column


ALTER TABLE myapp_limits_public.app_limits 
  DROP COLUMN purchased_credits RESTRICT;



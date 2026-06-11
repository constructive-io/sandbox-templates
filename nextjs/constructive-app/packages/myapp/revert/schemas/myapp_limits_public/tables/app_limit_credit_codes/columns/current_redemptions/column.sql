-- Revert: schemas/myapp_limits_public/tables/app_limit_credit_codes/columns/current_redemptions/column


ALTER TABLE myapp_limits_public.app_limit_credit_codes 
  DROP COLUMN current_redemptions RESTRICT;



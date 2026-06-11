-- Revert: schemas/myapp_limits_public/tables/app_limit_credits/columns/credit_type/column


ALTER TABLE myapp_limits_public.app_limit_credits 
  DROP COLUMN credit_type RESTRICT;



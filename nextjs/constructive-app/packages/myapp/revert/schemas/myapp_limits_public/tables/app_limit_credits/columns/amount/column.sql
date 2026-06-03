-- Revert: schemas/myapp_limits_public/tables/app_limit_credits/columns/amount/column


ALTER TABLE myapp_limits_public.app_limit_credits 
  DROP COLUMN amount RESTRICT;



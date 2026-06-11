-- Revert: schemas/myapp_limits_public/tables/app_limits/columns/period_credits/alterations/alt0000000064


ALTER TABLE myapp_limits_public.app_limits 
  ALTER COLUMN period_credits DROP DEFAULT;



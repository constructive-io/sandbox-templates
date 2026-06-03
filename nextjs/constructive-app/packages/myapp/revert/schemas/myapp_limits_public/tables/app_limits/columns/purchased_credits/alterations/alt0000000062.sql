-- Revert: schemas/myapp_limits_public/tables/app_limits/columns/purchased_credits/alterations/alt0000000062


ALTER TABLE myapp_limits_public.app_limits 
  ALTER COLUMN purchased_credits DROP DEFAULT;



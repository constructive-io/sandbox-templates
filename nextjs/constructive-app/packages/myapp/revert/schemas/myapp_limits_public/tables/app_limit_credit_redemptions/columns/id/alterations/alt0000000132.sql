-- Revert: schemas/myapp_limits_public/tables/app_limit_credit_redemptions/columns/id/alterations/alt0000000132


ALTER TABLE myapp_limits_public.app_limit_credit_redemptions 
  ALTER COLUMN id DROP DEFAULT;



-- Revert: schemas/myapp_limits_public/tables/app_limit_credit_codes/columns/current_redemptions/alterations/alt0000000112


ALTER TABLE myapp_limits_public.app_limit_credit_codes 
  ALTER COLUMN current_redemptions DROP NOT NULL;



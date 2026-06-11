-- Revert: schemas/myapp_limits_public/tables/app_limit_credit_redemptions/columns/credit_code_id/alterations/alt0000000133


ALTER TABLE myapp_limits_public.app_limit_credit_redemptions 
  ALTER COLUMN credit_code_id DROP NOT NULL;



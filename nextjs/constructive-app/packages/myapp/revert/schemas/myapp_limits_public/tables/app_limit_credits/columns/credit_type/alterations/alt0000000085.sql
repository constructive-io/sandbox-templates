-- Revert: schemas/myapp_limits_public/tables/app_limit_credits/columns/credit_type/alterations/alt0000000085


ALTER TABLE myapp_limits_public.app_limit_credits 
  ALTER COLUMN credit_type DROP NOT NULL;



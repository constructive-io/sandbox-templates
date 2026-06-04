-- Revert: schemas/myapp_limits_public/tables/app_limit_credit_code_items/columns/credit_type/alterations/alt0000000127


ALTER TABLE myapp_limits_public.app_limit_credit_code_items 
  ALTER COLUMN credit_type DROP DEFAULT;



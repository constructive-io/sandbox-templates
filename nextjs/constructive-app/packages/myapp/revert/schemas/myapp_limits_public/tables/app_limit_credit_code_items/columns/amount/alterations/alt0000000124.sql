-- Revert: schemas/myapp_limits_public/tables/app_limit_credit_code_items/columns/amount/alterations/alt0000000124


ALTER TABLE myapp_limits_public.app_limit_credit_code_items 
  ALTER COLUMN amount DROP NOT NULL;



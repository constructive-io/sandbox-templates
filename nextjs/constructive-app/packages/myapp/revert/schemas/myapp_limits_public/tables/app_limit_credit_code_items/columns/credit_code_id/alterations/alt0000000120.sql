-- Revert: schemas/myapp_limits_public/tables/app_limit_credit_code_items/columns/credit_code_id/alterations/alt0000000120


ALTER TABLE myapp_limits_public.app_limit_credit_code_items 
  ALTER COLUMN credit_code_id DROP NOT NULL;



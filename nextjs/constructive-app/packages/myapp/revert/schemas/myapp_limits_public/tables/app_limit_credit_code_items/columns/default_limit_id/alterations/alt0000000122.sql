-- Revert: schemas/myapp_limits_public/tables/app_limit_credit_code_items/columns/default_limit_id/alterations/alt0000000122


ALTER TABLE myapp_limits_public.app_limit_credit_code_items 
  ALTER COLUMN default_limit_id DROP NOT NULL;



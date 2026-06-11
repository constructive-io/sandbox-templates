-- Revert: schemas/myapp_limits_public/tables/app_limit_credit_code_items/columns/credit_type/column


ALTER TABLE myapp_limits_public.app_limit_credit_code_items 
  DROP COLUMN credit_type RESTRICT;



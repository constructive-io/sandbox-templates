-- Revert: schemas/myapp_limits_public/tables/app_limit_credit_code_items/constraints/app_limit_credit_code_items_pkey/constraint


ALTER TABLE myapp_limits_public.app_limit_credit_code_items 
  DROP CONSTRAINT app_limit_credit_code_items_pkey;



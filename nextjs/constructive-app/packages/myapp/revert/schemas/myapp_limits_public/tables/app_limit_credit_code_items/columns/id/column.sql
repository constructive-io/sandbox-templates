-- Revert: schemas/myapp_limits_public/tables/app_limit_credit_code_items/columns/id/column


ALTER TABLE myapp_limits_public.app_limit_credit_code_items 
  DROP COLUMN id RESTRICT;



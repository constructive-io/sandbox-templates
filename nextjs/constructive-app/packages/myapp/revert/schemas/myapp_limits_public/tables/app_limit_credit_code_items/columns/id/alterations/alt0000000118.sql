-- Revert: schemas/myapp_limits_public/tables/app_limit_credit_code_items/columns/id/alterations/alt0000000118


ALTER TABLE myapp_limits_public.app_limit_credit_code_items 
  ALTER COLUMN id DROP NOT NULL;



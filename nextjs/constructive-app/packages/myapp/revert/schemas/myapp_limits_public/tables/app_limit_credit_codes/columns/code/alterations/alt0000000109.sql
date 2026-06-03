-- Revert: schemas/myapp_limits_public/tables/app_limit_credit_codes/columns/code/alterations/alt0000000109


ALTER TABLE myapp_limits_public.app_limit_credit_codes 
  ALTER COLUMN code DROP NOT NULL;



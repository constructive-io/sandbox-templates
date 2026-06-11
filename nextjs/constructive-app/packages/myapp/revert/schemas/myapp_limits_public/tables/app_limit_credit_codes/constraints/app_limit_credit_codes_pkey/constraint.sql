-- Revert: schemas/myapp_limits_public/tables/app_limit_credit_codes/constraints/app_limit_credit_codes_pkey/constraint


ALTER TABLE myapp_limits_public.app_limit_credit_codes 
  DROP CONSTRAINT app_limit_credit_codes_pkey;



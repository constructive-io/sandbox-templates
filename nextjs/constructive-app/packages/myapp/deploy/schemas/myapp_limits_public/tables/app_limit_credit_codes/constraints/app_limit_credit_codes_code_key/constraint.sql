-- Deploy: schemas/myapp_limits_public/tables/app_limit_credit_codes/constraints/app_limit_credit_codes_code_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_codes/table


ALTER TABLE myapp_limits_public.app_limit_credit_codes 
  ADD CONSTRAINT app_limit_credit_codes_code_key 
    UNIQUE (code);


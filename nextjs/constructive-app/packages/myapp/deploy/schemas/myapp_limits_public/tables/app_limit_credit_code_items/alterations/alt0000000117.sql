-- Deploy: schemas/myapp_limits_public/tables/app_limit_credit_code_items/alterations/alt0000000117
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_code_items/table


COMMENT ON TABLE myapp_limits_public.app_limit_credit_code_items IS E'Items within a credit code — each row grants credits for a specific limit definition';


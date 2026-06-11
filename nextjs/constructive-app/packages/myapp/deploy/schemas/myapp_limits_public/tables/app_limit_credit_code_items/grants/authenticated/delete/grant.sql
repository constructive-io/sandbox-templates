-- Deploy: schemas/myapp_limits_public/tables/app_limit_credit_code_items/grants/authenticated/delete/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_code_items/table


GRANT DELETE ON myapp_limits_public.app_limit_credit_code_items TO authenticated;


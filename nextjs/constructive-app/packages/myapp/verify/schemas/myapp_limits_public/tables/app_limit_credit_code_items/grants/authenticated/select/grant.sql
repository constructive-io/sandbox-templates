-- Verify: schemas/myapp_limits_public/tables/app_limit_credit_code_items/grants/authenticated/select/grant


SELECT verify_table_grant('myapp_limits_public.app_limit_credit_code_items', 'select', 'authenticated');



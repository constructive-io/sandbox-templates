-- Verify: schemas/myapp_limits_public/tables/app_limit_caps/grants/authenticated/insert/grant


SELECT verify_table_grant('myapp_limits_public.app_limit_caps', 'insert', 'authenticated');



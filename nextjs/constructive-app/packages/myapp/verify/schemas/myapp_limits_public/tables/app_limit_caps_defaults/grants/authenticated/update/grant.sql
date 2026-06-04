-- Verify: schemas/myapp_limits_public/tables/app_limit_caps_defaults/grants/authenticated/update/grant


SELECT verify_table_grant('myapp_limits_public.app_limit_caps_defaults', 'update', 'authenticated');



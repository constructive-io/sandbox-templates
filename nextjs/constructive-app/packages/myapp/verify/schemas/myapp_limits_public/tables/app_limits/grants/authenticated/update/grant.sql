-- Verify: schemas/myapp_limits_public/tables/app_limits/grants/authenticated/update/grant


SELECT verify_table_grant('myapp_limits_public.app_limits', 'update', 'authenticated');



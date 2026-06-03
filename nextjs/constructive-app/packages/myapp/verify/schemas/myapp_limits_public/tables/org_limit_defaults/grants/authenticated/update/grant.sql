-- Verify: schemas/myapp_limits_public/tables/org_limit_defaults/grants/authenticated/update/grant


SELECT verify_table_grant('myapp_limits_public.org_limit_defaults', 'update', 'authenticated');



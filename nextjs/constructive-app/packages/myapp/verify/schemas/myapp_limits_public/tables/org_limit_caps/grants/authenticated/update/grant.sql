-- Verify: schemas/myapp_limits_public/tables/org_limit_caps/grants/authenticated/update/grant


SELECT verify_table_grant('myapp_limits_public.org_limit_caps', 'update', 'authenticated');



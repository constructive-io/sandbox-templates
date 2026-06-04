-- Verify: schemas/myapp_limits_public/tables/org_limit_caps/grants/authenticated/delete/grant


SELECT verify_table_grant('myapp_limits_public.org_limit_caps', 'delete', 'authenticated');



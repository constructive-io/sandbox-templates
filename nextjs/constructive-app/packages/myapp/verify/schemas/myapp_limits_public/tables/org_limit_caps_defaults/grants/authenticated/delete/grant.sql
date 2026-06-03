-- Verify: schemas/myapp_limits_public/tables/org_limit_caps_defaults/grants/authenticated/delete/grant


SELECT verify_table_grant('myapp_limits_public.org_limit_caps_defaults', 'delete', 'authenticated');



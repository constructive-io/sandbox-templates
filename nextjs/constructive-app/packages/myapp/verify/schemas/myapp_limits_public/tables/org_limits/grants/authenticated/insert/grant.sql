-- Verify: schemas/myapp_limits_public/tables/org_limits/grants/authenticated/insert/grant


SELECT verify_table_grant('myapp_limits_public.org_limits', 'insert', 'authenticated');



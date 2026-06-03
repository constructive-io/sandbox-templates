-- Verify: schemas/myapp_permissions_public/tables/org_permissions/grants/authenticated/insert/grant


SELECT verify_table_grant('myapp_permissions_public.org_permissions', 'insert', 'authenticated');



-- Verify: schemas/myapp_permissions_public/tables/org_permissions/grants/authenticated/select/grant


SELECT verify_table_grant('myapp_permissions_public.org_permissions', 'select', 'authenticated');



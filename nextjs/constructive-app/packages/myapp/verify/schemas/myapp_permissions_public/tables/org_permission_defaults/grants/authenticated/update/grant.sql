-- Verify: schemas/myapp_permissions_public/tables/org_permission_defaults/grants/authenticated/update/grant


SELECT verify_table_grant('myapp_permissions_public.org_permission_defaults', 'update', 'authenticated');



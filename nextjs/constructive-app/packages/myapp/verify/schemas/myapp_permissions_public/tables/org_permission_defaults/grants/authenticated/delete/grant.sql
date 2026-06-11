-- Verify: schemas/myapp_permissions_public/tables/org_permission_defaults/grants/authenticated/delete/grant


SELECT verify_table_grant('myapp_permissions_public.org_permission_defaults', 'delete', 'authenticated');



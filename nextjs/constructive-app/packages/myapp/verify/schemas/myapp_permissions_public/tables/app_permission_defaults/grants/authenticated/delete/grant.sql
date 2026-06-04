-- Verify: schemas/myapp_permissions_public/tables/app_permission_defaults/grants/authenticated/delete/grant


SELECT verify_table_grant('myapp_permissions_public.app_permission_defaults', 'delete', 'authenticated');



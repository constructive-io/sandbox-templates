-- Verify: schemas/myapp_permissions_public/tables/app_permissions/grants/authenticated/delete/grant


SELECT verify_table_grant('myapp_permissions_public.app_permissions', 'delete', 'authenticated');



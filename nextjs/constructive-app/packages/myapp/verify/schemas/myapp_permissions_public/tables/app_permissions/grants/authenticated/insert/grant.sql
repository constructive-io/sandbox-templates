-- Verify: schemas/myapp_permissions_public/tables/app_permissions/grants/authenticated/insert/grant


SELECT verify_table_grant('myapp_permissions_public.app_permissions', 'insert', 'authenticated');



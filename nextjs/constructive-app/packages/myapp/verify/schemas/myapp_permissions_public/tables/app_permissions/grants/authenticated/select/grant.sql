-- Verify: schemas/myapp_permissions_public/tables/app_permissions/grants/authenticated/select/grant


SELECT verify_table_grant('myapp_permissions_public.app_permissions', 'select', 'authenticated');



-- Verify: schemas/myapp_store_public/tables/app_config/grants/authenticated/update/grant


SELECT verify_table_grant('myapp_store_public.app_config', 'update', 'authenticated');



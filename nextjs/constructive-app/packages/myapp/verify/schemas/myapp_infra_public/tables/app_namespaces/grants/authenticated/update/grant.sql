-- Verify: schemas/myapp_infra_public/tables/app_namespaces/grants/authenticated/update/grant


SELECT verify_table_grant('myapp_infra_public.app_namespaces', 'update', 'authenticated');



-- Verify: schemas/myapp_infra_public/tables/app_namespaces/grants/authenticated/select/grant


SELECT verify_table_grant('myapp_infra_public.app_namespaces', 'select', 'authenticated');



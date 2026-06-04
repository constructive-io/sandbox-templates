-- Verify: schemas/myapp_infra_public/tables/app_namespace_events/grants/authenticated/update/grant


SELECT verify_table_grant('myapp_infra_public.app_namespace_events', 'update', 'authenticated');



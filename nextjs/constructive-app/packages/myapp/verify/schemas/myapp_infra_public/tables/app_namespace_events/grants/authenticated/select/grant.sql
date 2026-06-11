-- Verify: schemas/myapp_infra_public/tables/app_namespace_events/grants/authenticated/select/grant


SELECT verify_table_grant('myapp_infra_public.app_namespace_events', 'select', 'authenticated');



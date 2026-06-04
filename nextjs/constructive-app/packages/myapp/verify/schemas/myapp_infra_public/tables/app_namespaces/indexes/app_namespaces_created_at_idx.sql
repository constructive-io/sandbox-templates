-- Verify: schemas/myapp_infra_public/tables/app_namespaces/indexes/app_namespaces_created_at_idx


SELECT verify_index('myapp_infra_public.app_namespaces', 'app_namespaces_created_at_idx');



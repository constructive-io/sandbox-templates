-- Revert: schemas/myapp_infra_public/tables/app_namespaces/grants/authenticated/insert/grant


REVOKE INSERT ON myapp_infra_public.app_namespaces FROM authenticated;



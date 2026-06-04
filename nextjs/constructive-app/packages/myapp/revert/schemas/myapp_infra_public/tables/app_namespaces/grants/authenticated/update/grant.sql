-- Revert: schemas/myapp_infra_public/tables/app_namespaces/grants/authenticated/update/grant


REVOKE UPDATE ON myapp_infra_public.app_namespaces FROM authenticated;



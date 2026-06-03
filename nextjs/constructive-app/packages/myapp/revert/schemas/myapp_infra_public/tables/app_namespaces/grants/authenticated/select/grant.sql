-- Revert: schemas/myapp_infra_public/tables/app_namespaces/grants/authenticated/select/grant


REVOKE SELECT ON myapp_infra_public.app_namespaces FROM authenticated;



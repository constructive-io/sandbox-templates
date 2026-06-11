-- Revert: schemas/myapp_infra_public/tables/app_namespaces/grants/authenticated/delete/grant


REVOKE DELETE ON myapp_infra_public.app_namespaces FROM authenticated;



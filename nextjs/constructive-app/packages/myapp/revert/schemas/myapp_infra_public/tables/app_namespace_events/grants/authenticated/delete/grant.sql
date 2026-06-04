-- Revert: schemas/myapp_infra_public/tables/app_namespace_events/grants/authenticated/delete/grant


REVOKE DELETE ON myapp_infra_public.app_namespace_events FROM authenticated;



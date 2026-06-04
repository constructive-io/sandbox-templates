-- Revert: schemas/myapp_permissions_public/tables/app_permissions/grants/authenticated/select/grant


REVOKE SELECT ON myapp_permissions_public.app_permissions FROM authenticated;



-- Revert: schemas/myapp_permissions_public/tables/app_permissions/grants/authenticated/update/grant


REVOKE UPDATE ON myapp_permissions_public.app_permissions FROM authenticated;



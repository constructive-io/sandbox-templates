-- Revert: schemas/myapp_permissions_public/tables/app_permissions/grants/authenticated/delete/grant


REVOKE DELETE ON myapp_permissions_public.app_permissions FROM authenticated;



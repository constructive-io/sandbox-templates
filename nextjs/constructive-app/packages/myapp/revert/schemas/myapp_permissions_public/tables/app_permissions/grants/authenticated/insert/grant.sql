-- Revert: schemas/myapp_permissions_public/tables/app_permissions/grants/authenticated/insert/grant


REVOKE INSERT ON myapp_permissions_public.app_permissions FROM authenticated;



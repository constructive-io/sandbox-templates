-- Revert: schemas/myapp_permissions_public/tables/app_permission_defaults/grants/authenticated/insert/grant


REVOKE INSERT ON myapp_permissions_public.app_permission_defaults FROM authenticated;



-- Revert: schemas/myapp_permissions_public/tables/org_permission_defaults/grants/authenticated/update/grant


REVOKE UPDATE ON myapp_permissions_public.org_permission_defaults FROM authenticated;



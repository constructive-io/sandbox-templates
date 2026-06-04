-- Revert: schemas/myapp_permissions_public/tables/org_permission_defaults/grants/authenticated/insert/grant


REVOKE INSERT ON myapp_permissions_public.org_permission_defaults FROM authenticated;



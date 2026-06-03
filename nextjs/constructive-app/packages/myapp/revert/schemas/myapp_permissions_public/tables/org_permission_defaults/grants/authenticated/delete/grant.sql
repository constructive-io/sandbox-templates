-- Revert: schemas/myapp_permissions_public/tables/org_permission_defaults/grants/authenticated/delete/grant


REVOKE DELETE ON myapp_permissions_public.org_permission_defaults FROM authenticated;



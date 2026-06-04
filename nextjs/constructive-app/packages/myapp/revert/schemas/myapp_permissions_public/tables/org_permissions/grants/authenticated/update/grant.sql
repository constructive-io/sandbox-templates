-- Revert: schemas/myapp_permissions_public/tables/org_permissions/grants/authenticated/update/grant


REVOKE UPDATE ON myapp_permissions_public.org_permissions FROM authenticated;



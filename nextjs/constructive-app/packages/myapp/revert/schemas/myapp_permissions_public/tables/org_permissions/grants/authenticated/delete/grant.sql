-- Revert: schemas/myapp_permissions_public/tables/org_permissions/grants/authenticated/delete/grant


REVOKE DELETE ON myapp_permissions_public.org_permissions FROM authenticated;



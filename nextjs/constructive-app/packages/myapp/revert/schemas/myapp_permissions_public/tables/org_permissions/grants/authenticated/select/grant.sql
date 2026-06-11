-- Revert: schemas/myapp_permissions_public/tables/org_permissions/grants/authenticated/select/grant


REVOKE SELECT ON myapp_permissions_public.org_permissions FROM authenticated;



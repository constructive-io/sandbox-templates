-- Revert: schemas/myapp_memberships_public/tables/org_permission_default_permissions/grants/authenticated/insert/grant


REVOKE INSERT ON myapp_memberships_public.org_permission_default_permissions FROM authenticated;



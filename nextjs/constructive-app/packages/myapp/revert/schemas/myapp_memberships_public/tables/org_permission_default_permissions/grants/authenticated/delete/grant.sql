-- Revert: schemas/myapp_memberships_public/tables/org_permission_default_permissions/grants/authenticated/delete/grant


REVOKE DELETE ON myapp_memberships_public.org_permission_default_permissions FROM authenticated;



-- Revert: schemas/myapp_memberships_public/tables/org_permission_default_permissions/grants/authenticated/select/grant


REVOKE SELECT ON myapp_memberships_public.org_permission_default_permissions FROM authenticated;



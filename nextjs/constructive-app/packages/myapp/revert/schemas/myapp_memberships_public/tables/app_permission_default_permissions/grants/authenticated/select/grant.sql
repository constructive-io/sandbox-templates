-- Revert: schemas/myapp_memberships_public/tables/app_permission_default_permissions/grants/authenticated/select/grant


REVOKE SELECT ON myapp_memberships_public.app_permission_default_permissions FROM authenticated;



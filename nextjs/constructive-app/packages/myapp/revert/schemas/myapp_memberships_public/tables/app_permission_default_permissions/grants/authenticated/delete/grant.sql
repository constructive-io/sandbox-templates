-- Revert: schemas/myapp_memberships_public/tables/app_permission_default_permissions/grants/authenticated/delete/grant


REVOKE DELETE ON myapp_memberships_public.app_permission_default_permissions FROM authenticated;



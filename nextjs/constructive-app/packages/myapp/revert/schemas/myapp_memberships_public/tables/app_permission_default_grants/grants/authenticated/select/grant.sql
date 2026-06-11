-- Revert: schemas/myapp_memberships_public/tables/app_permission_default_grants/grants/authenticated/select/grant


REVOKE SELECT ON myapp_memberships_public.app_permission_default_grants FROM authenticated;



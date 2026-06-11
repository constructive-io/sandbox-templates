-- Revert: schemas/myapp_memberships_public/tables/app_memberships/grants/authenticated/select/grant


REVOKE SELECT ON myapp_memberships_public.app_memberships FROM authenticated;



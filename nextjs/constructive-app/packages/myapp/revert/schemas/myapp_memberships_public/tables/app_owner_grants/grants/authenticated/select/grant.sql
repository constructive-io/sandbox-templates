-- Revert: schemas/myapp_memberships_public/tables/app_owner_grants/grants/authenticated/select/grant


REVOKE SELECT ON myapp_memberships_public.app_owner_grants FROM authenticated;



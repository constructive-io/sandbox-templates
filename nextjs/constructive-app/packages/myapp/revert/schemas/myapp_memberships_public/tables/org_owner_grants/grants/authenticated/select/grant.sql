-- Revert: schemas/myapp_memberships_public/tables/org_owner_grants/grants/authenticated/select/grant


REVOKE SELECT ON myapp_memberships_public.org_owner_grants FROM authenticated;



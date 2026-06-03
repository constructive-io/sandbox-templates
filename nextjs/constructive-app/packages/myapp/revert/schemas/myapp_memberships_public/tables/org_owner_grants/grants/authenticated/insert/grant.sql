-- Revert: schemas/myapp_memberships_public/tables/org_owner_grants/grants/authenticated/insert/grant


REVOKE INSERT ON myapp_memberships_public.org_owner_grants FROM authenticated;



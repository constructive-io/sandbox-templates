-- Revert: schemas/myapp_memberships_public/tables/org_grants/grants/authenticated/insert/grant


REVOKE INSERT ON myapp_memberships_public.org_grants FROM authenticated;



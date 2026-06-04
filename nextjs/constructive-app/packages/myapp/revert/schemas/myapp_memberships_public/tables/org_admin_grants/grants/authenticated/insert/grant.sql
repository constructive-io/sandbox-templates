-- Revert: schemas/myapp_memberships_public/tables/org_admin_grants/grants/authenticated/insert/grant


REVOKE INSERT ON myapp_memberships_public.org_admin_grants FROM authenticated;



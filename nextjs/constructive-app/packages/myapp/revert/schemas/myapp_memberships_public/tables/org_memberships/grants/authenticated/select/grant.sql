-- Revert: schemas/myapp_memberships_public/tables/org_memberships/grants/authenticated/select/grant


REVOKE SELECT ON myapp_memberships_public.org_memberships FROM authenticated;



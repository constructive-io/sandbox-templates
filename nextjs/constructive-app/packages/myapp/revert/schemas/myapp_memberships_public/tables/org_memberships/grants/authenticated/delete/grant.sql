-- Revert: schemas/myapp_memberships_public/tables/org_memberships/grants/authenticated/delete/grant


REVOKE DELETE ON myapp_memberships_public.org_memberships FROM authenticated;



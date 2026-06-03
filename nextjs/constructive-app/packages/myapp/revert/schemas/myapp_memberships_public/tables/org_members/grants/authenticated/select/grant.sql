-- Revert: schemas/myapp_memberships_public/tables/org_members/grants/authenticated/select/grant


REVOKE SELECT ON myapp_memberships_public.org_members FROM authenticated;



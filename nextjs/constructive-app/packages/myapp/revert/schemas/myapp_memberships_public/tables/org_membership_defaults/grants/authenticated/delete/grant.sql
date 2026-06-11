-- Revert: schemas/myapp_memberships_public/tables/org_membership_defaults/grants/authenticated/delete/grant


REVOKE DELETE ON myapp_memberships_public.org_membership_defaults FROM authenticated;



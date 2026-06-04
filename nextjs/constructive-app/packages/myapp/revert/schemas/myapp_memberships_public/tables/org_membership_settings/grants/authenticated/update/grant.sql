-- Revert: schemas/myapp_memberships_public/tables/org_membership_settings/grants/authenticated/update/grant


REVOKE UPDATE ON myapp_memberships_public.org_membership_settings FROM authenticated;



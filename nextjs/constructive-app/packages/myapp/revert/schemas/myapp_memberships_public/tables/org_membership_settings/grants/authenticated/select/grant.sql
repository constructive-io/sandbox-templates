-- Revert: schemas/myapp_memberships_public/tables/org_membership_settings/grants/authenticated/select/grant


REVOKE SELECT ON myapp_memberships_public.org_membership_settings FROM authenticated;



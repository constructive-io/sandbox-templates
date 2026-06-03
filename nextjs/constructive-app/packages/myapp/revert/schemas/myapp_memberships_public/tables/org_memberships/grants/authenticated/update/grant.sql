-- Revert: schemas/myapp_memberships_public/tables/org_memberships/grants/authenticated/update/grant


REVOKE UPDATE (is_banned, is_approved, is_disabled, granted, is_read_only) ON myapp_memberships_public.org_memberships FROM authenticated;



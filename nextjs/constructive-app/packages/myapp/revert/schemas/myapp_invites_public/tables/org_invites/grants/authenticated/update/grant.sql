-- Revert: schemas/myapp_invites_public/tables/org_invites/grants/authenticated/update/grant


REVOKE UPDATE ON myapp_invites_public.org_invites FROM authenticated;



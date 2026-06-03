-- Revert: schemas/myapp_invites_public/tables/org_invites/grants/authenticated/select/grant


REVOKE SELECT ON myapp_invites_public.org_invites FROM authenticated;



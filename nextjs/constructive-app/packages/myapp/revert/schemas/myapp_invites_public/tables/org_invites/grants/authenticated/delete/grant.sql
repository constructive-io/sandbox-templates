-- Revert: schemas/myapp_invites_public/tables/org_invites/grants/authenticated/delete/grant


REVOKE DELETE ON myapp_invites_public.org_invites FROM authenticated;



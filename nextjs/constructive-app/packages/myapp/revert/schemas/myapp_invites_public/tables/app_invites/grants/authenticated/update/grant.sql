-- Revert: schemas/myapp_invites_public/tables/app_invites/grants/authenticated/update/grant


REVOKE UPDATE ON myapp_invites_public.app_invites FROM authenticated;



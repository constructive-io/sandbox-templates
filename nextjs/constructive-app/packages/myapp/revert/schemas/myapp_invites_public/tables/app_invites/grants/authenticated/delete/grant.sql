-- Revert: schemas/myapp_invites_public/tables/app_invites/grants/authenticated/delete/grant


REVOKE DELETE ON myapp_invites_public.app_invites FROM authenticated;



-- Revert: schemas/myapp_invites_public/tables/app_invites/grants/authenticated/select/grant


REVOKE SELECT ON myapp_invites_public.app_invites FROM authenticated;



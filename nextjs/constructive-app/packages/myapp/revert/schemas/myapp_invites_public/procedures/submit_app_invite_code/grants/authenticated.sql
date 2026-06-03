-- Revert: schemas/myapp_invites_public/procedures/submit_app_invite_code/grants/authenticated


REVOKE EXECUTE ON FUNCTION myapp_invites_public.submit_app_invite_code FROM authenticated;



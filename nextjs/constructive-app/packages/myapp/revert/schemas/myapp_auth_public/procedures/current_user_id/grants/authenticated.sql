-- Revert: schemas/myapp_auth_public/procedures/current_user_id/grants/authenticated


REVOKE EXECUTE ON FUNCTION myapp_auth_public.current_user_id FROM authenticated;



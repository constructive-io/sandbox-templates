-- Revert: schemas/myapp_auth_public/procedures/check_password/grants/public


REVOKE EXECUTE ON FUNCTION myapp_auth_public.check_password FROM public;



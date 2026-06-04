-- Revert: schemas/myapp_auth_private/procedures/authenticate/grants/authenticated


REVOKE EXECUTE ON FUNCTION myapp_auth_private.authenticate FROM authenticated;



-- Revert: schemas/myapp_auth_private/procedures/authenticate_strict/grants/authenticated


REVOKE EXECUTE ON FUNCTION myapp_auth_private.authenticate_strict FROM authenticated;



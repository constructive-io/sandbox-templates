-- Revert: schemas/myapp_auth_private/procedures/authenticate/grants/anonymous


REVOKE EXECUTE ON FUNCTION myapp_auth_private.authenticate FROM anonymous;



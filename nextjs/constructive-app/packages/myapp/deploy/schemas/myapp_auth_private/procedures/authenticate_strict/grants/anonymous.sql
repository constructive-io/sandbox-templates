-- Deploy: schemas/myapp_auth_private/procedures/authenticate_strict/grants/anonymous
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/procedures/authenticate_strict/procedure


GRANT EXECUTE ON FUNCTION myapp_auth_private.authenticate_strict TO anonymous;


-- Deploy: schemas/myapp_auth_private/procedures/authenticate/grants/anonymous
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/procedures/authenticate/procedure


GRANT EXECUTE ON FUNCTION myapp_auth_private.authenticate TO anonymous;


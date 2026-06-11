-- Deploy: schemas/myapp_auth_public/procedures/check_password/grants/public
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_public/procedures/check_password/procedure


GRANT EXECUTE ON FUNCTION myapp_auth_public.check_password TO public;


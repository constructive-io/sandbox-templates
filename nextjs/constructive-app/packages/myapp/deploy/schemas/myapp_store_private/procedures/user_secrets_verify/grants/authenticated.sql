-- Deploy: schemas/myapp_store_private/procedures/user_secrets_verify/grants/authenticated
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/procedures/user_secrets_verify/procedure


GRANT EXECUTE ON FUNCTION myapp_store_private.user_secrets_verify TO authenticated;


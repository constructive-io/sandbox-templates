-- Revert: schemas/myapp_store_private/procedures/user_secrets_verify/grants/authenticated


REVOKE EXECUTE ON FUNCTION myapp_store_private.user_secrets_verify FROM authenticated;



-- Revert: schemas/myapp_store_private/procedures/user_secrets_set/grants/authenticated


REVOKE EXECUTE ON FUNCTION myapp_store_private.user_secrets_set FROM authenticated;



-- Revert: schemas/myapp_store_private/procedures/user_secrets_get/grants/authenticated


REVOKE EXECUTE ON FUNCTION myapp_store_private.user_secrets_get FROM authenticated;



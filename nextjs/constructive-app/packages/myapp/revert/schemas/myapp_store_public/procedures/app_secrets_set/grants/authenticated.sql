-- Revert: schemas/myapp_store_public/procedures/app_secrets_set/grants/authenticated


REVOKE EXECUTE ON FUNCTION myapp_store_public.app_secrets_set FROM authenticated;



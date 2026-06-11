-- Revert: schemas/myapp_store_public/procedures/app_secrets_del/grants/authenticated


REVOKE EXECUTE ON FUNCTION myapp_store_public.app_secrets_del FROM authenticated;



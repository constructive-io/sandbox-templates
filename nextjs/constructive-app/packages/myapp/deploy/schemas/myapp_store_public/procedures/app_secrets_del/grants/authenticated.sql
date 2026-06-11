-- Deploy: schemas/myapp_store_public/procedures/app_secrets_del/grants/authenticated
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_public/procedures/app_secrets_del/procedure


GRANT EXECUTE ON FUNCTION myapp_store_public.app_secrets_del TO authenticated;


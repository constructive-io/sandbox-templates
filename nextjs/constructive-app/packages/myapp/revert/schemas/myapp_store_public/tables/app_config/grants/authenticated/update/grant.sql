-- Revert: schemas/myapp_store_public/tables/app_config/grants/authenticated/update/grant


REVOKE UPDATE ON myapp_store_public.app_config FROM authenticated;



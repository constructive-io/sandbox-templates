-- Revert: schemas/myapp_store_public/tables/app_config/grants/authenticated/insert/grant


REVOKE INSERT ON myapp_store_public.app_config FROM authenticated;



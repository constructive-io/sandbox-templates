-- Revert: schemas/myapp_store_public/tables/app_config/grants/authenticated/delete/grant


REVOKE DELETE ON myapp_store_public.app_config FROM authenticated;



-- Revert: schemas/myapp_store_public/tables/app_config/grants/authenticated/select/grant


REVOKE SELECT ON myapp_store_public.app_config FROM authenticated;



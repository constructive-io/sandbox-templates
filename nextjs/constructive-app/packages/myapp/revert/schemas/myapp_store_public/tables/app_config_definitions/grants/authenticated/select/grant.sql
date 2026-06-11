-- Revert: schemas/myapp_store_public/tables/app_config_definitions/grants/authenticated/select/grant


REVOKE SELECT ON myapp_store_public.app_config_definitions FROM authenticated;



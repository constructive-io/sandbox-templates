-- Deploy: schemas/myapp_store_public/tables/app_config_definitions/columns/default_value/alterations/alt0000001429
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_public/schema
-- requires: schemas/myapp_store_public/tables/app_config_definitions/columns/default_value/column


COMMENT ON COLUMN myapp_store_public.app_config_definitions.default_value IS 'Default value used when no config entry exists for a namespace';


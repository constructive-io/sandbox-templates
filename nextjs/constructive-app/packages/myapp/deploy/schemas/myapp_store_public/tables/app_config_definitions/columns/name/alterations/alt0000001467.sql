-- Deploy: schemas/myapp_store_public/tables/app_config_definitions/columns/name/alterations/alt0000001467
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_public/schema
-- requires: schemas/myapp_store_public/tables/app_config_definitions/columns/name/column


COMMENT ON COLUMN myapp_store_public.app_config_definitions.name IS E'Config key name (must match config table name for resolution)';


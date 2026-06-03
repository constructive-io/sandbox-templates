-- Deploy: schemas/myapp_store_public/tables/app_config_definitions/columns/description/alterations/alt0000001428
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_public/schema
-- requires: schemas/myapp_store_public/tables/app_config_definitions/columns/description/column


COMMENT ON COLUMN myapp_store_public.app_config_definitions.description IS E'Human-readable description of what this config key controls';


-- Deploy: schemas/myapp_store_public/tables/app_config_definitions/columns/is_built_in/alterations/alt0000001472
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_public/schema
-- requires: schemas/myapp_store_public/tables/app_config_definitions/columns/is_built_in/column


COMMENT ON COLUMN myapp_store_public.app_config_definitions.is_built_in IS E'Whether this row was seeded as a built-in config definition';


-- Deploy: schemas/myapp_store_public/tables/app_config_definitions/columns/labels/alterations/alt0000001435
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_public/schema
-- requires: schemas/myapp_store_public/tables/app_config_definitions/columns/labels/column


COMMENT ON COLUMN myapp_store_public.app_config_definitions.labels IS E'Key-value metadata for filtering and grouping config definitions';


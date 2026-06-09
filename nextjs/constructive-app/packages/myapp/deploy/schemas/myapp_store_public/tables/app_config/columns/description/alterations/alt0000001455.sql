-- Deploy: schemas/myapp_store_public/tables/app_config/columns/description/alterations/alt0000001455
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_public/schema
-- requires: schemas/myapp_store_public/tables/app_config/columns/description/column


COMMENT ON COLUMN myapp_store_public.app_config.description IS E'Human-readable note about this config entry';


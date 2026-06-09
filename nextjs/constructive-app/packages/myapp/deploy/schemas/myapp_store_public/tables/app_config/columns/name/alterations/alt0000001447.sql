-- Deploy: schemas/myapp_store_public/tables/app_config/columns/name/alterations/alt0000001447
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_public/schema
-- requires: schemas/myapp_store_public/tables/app_config/columns/name/column


COMMENT ON COLUMN myapp_store_public.app_config.name IS 'Key name identifying the config entry';


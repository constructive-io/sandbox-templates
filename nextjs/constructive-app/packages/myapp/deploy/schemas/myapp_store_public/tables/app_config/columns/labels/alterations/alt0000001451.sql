-- Deploy: schemas/myapp_store_public/tables/app_config/columns/labels/alterations/alt0000001451
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_public/schema
-- requires: schemas/myapp_store_public/tables/app_config/columns/labels/column


COMMENT ON COLUMN myapp_store_public.app_config.labels IS E'Key/value pairs for selecting/filtering config entries';


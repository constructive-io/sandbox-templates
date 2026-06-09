-- Deploy: schemas/myapp_store_public/tables/app_config/columns/namespace_id/alterations/alt0000001445
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_public/schema
-- requires: schemas/myapp_store_public/tables/app_config/columns/namespace_id/column


COMMENT ON COLUMN myapp_store_public.app_config.namespace_id IS E'FK to namespaces — logical grouping for config entries';


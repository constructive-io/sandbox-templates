-- Deploy: schemas/myapp_store_private/tables/app_secrets/columns/namespace_id/alterations/alt0000001425
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/app_secrets/columns/namespace_id/column


COMMENT ON COLUMN myapp_store_private.app_secrets.namespace_id IS E'FK to namespaces — logical grouping for secrets';


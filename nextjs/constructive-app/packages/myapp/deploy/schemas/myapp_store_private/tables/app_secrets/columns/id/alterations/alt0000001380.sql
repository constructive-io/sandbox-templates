-- Deploy: schemas/myapp_store_private/tables/app_secrets/columns/id/alterations/alt0000001380
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/app_secrets/columns/id/column


COMMENT ON COLUMN myapp_store_private.app_secrets.id IS 'Unique identifier for this secret entry';


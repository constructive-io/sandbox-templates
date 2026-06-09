-- Deploy: schemas/myapp_store_private/tables/app_secrets/columns/description/alterations/alt0000001436
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/app_secrets/columns/description/column


COMMENT ON COLUMN myapp_store_private.app_secrets.description IS E'Human-readable note about this secret';


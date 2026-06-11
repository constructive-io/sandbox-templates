-- Deploy: schemas/myapp_store_private/tables/user_secrets/columns/id/alterations/alt0000001407
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/user_secrets/columns/id/column


COMMENT ON COLUMN myapp_store_private.user_secrets.id IS 'Unique identifier for this credential entry';


-- Deploy: schemas/myapp_store_private/tables/user_secrets/columns/owner_id/alterations/alt0000001369
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/user_secrets/columns/owner_id/column


COMMENT ON COLUMN myapp_store_private.user_secrets.owner_id IS 'User who owns this credential';


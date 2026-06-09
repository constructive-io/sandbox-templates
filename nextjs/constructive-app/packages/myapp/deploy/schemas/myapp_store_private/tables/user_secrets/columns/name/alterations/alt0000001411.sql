-- Deploy: schemas/myapp_store_private/tables/user_secrets/columns/name/alterations/alt0000001411
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/user_secrets/columns/name/column


COMMENT ON COLUMN myapp_store_private.user_secrets.name IS E'Key name identifying the credential (e.g. password_hash)';


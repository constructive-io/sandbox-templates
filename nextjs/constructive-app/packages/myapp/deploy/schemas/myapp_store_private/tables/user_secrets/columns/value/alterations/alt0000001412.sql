-- Deploy: schemas/myapp_store_private/tables/user_secrets/columns/value/alterations/alt0000001412
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/user_secrets/columns/value/column


COMMENT ON COLUMN myapp_store_private.user_secrets.value IS E'The bcrypt-hashed credential value stored as binary';


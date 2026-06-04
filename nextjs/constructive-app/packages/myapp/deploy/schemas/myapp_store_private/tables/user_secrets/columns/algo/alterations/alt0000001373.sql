-- Deploy: schemas/myapp_store_private/tables/user_secrets/columns/algo/alterations/alt0000001373
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/user_secrets/columns/algo/column


COMMENT ON COLUMN myapp_store_private.user_secrets.algo IS E'Hash algorithm used (crypt/bcrypt)';


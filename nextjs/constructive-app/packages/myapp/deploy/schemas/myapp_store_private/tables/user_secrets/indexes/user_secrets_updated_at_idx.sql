-- Deploy: schemas/myapp_store_private/tables/user_secrets/indexes/user_secrets_updated_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/user_secrets/table
-- requires: schemas/myapp_store_private/tables/user_secrets/columns/updated_at/column


CREATE INDEX user_secrets_updated_at_idx ON myapp_store_private.user_secrets ( updated_at );


-- Deploy: schemas/myapp_store_private/tables/app_secrets/indexes/app_secrets_created_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/app_secrets/table
-- requires: schemas/myapp_store_private/tables/app_secrets/columns/created_at/column


CREATE INDEX app_secrets_created_at_idx ON myapp_store_private.app_secrets ( created_at );


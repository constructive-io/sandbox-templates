-- Deploy: schemas/myapp_store_private/tables/app_secrets/columns/value/alterations/alt0000001428
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/app_secrets/columns/value/column


COMMENT ON COLUMN myapp_store_private.app_secrets.value IS E'The PGP-encrypted secret value stored as binary';


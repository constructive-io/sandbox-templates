-- Deploy: schemas/myapp_store_private/tables/app_secrets/columns/key_id/alterations/alt0000001423
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/app_secrets/columns/key_id/column


COMMENT ON COLUMN myapp_store_private.app_secrets.key_id IS E'Per-secret key used as PGP symmetric encryption passphrase';


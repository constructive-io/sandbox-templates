-- Deploy: schemas/myapp_store_private/tables/app_secrets/alterations/alt0000001377
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/app_secrets/table


COMMENT ON TABLE myapp_store_private.app_secrets IS E'app-level PGP-encrypted key-value secrets store';


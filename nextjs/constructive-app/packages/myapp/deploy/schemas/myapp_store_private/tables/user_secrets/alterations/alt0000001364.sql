-- Deploy: schemas/myapp_store_private/tables/user_secrets/alterations/alt0000001364
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/user_secrets/table


COMMENT ON TABLE myapp_store_private.user_secrets IS E'Per-user bcrypt credential store (password hashes, API key hashes)';


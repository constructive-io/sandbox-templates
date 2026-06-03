-- Deploy: schemas/myapp_store_private/tables/user_state/columns/value/alterations/alt0000001038
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/user_state/columns/value/column


COMMENT ON COLUMN myapp_store_private.user_state.value IS 'The plaintext state value';


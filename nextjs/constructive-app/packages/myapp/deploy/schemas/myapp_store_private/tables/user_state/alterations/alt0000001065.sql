-- Deploy: schemas/myapp_store_private/tables/user_state/alterations/alt0000001065
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/user_state/table


COMMENT ON TABLE myapp_store_private.user_state IS E'Internal per-user state store for auth counters, tokens, and ephemeral data';


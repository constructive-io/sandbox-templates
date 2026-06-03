-- Deploy: schemas/myapp_auth_private/tables/session_credentials/alterations/alt0000001070
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/session_credentials/table


COMMENT ON TABLE myapp_auth_private.session_credentials IS E'Authentication credentials (bearer tokens, cookies, API keys, magic links) tied to sessions';


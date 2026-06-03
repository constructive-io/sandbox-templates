-- Deploy: schemas/myapp_auth_private/tables/session_credentials/columns/last_used_at/alterations/alt0000001083
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/session_credentials/columns/last_used_at/column


COMMENT ON COLUMN myapp_auth_private.session_credentials.last_used_at IS 'Timestamp of the last time this credential was used for authentication';


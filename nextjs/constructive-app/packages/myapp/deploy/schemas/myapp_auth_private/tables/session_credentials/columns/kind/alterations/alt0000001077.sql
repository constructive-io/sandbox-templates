-- Deploy: schemas/myapp_auth_private/tables/session_credentials/columns/kind/alterations/alt0000001077
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/session_credentials/columns/kind/column


COMMENT ON COLUMN myapp_auth_private.session_credentials.kind IS E'Credential type: bearer (JWT), cookie, api_key, or magic_link';


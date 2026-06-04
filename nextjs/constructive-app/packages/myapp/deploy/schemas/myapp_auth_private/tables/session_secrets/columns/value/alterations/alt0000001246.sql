-- Deploy: schemas/myapp_auth_private/tables/session_secrets/columns/value/alterations/alt0000001246
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/session_secrets/columns/value/column


COMMENT ON COLUMN myapp_auth_private.session_secrets.value IS E'The secret payload; use base64url for binary data';


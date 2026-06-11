-- Deploy: schemas/myapp_auth_private/tables/session_credentials/columns/ot_token/alterations/alt0000001121
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/session_credentials/columns/ot_token/column


COMMENT ON COLUMN myapp_auth_private.session_credentials.ot_token IS E'One-time token for magic link or passwordless authentication flows';


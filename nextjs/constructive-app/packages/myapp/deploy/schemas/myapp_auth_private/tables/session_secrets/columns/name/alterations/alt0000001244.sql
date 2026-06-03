-- Deploy: schemas/myapp_auth_private/tables/session_secrets/columns/name/alterations/alt0000001244
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/session_secrets/columns/name/column


COMMENT ON COLUMN myapp_auth_private.session_secrets.name IS E'Key name within the session namespace (e.g. webauthn_sign_in_challenge, mfa_challenge_token)';


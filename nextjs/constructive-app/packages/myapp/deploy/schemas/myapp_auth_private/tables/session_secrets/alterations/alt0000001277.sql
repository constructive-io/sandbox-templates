-- Deploy: schemas/myapp_auth_private/tables/session_secrets/alterations/alt0000001277
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/session_secrets/table


COMMENT ON TABLE myapp_auth_private.session_secrets IS E'DB-private, session-scoped ephemeral key-value store for challenges/nonces (e.g. WebAuthn challenges, MFA tokens, magic-link nonces). Never exposed to clients; accessed only by SECURITY DEFINER procedures on the private schema.';


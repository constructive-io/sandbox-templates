-- Deploy: schemas/myapp_auth_private/tables/session_credentials/columns/mfa_level/alterations/alt0000001124
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/session_credentials/columns/mfa_level/column


COMMENT ON COLUMN myapp_auth_private.session_credentials.mfa_level IS E'MFA level of this credential: none (no MFA), verified (created with MFA), enforced (per-action MFA)';


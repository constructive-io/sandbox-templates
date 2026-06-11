-- Deploy: schemas/myapp_auth_private/tables/sessions/columns/last_mfa_verified/alterations/alt0000001097
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/sessions/columns/last_mfa_verified/column


COMMENT ON COLUMN myapp_auth_private.sessions.last_mfa_verified IS E'Timestamp of last MFA verification for step-up authentication';


-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/mfa_challenge_expiry/alterations/alt0000001131
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/mfa_challenge_expiry/column


COMMENT ON COLUMN myapp_auth_private.app_settings_auth.mfa_challenge_expiry IS 'How long an MFA challenge token remains valid after password verification';


-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/allow_webauthn_sign_up/alterations/alt0000001199
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/allow_webauthn_sign_up/column


COMMENT ON COLUMN myapp_auth_private.app_settings_auth.allow_webauthn_sign_up IS E'Whether WebAuthn / passkey registration during sign-up is allowed';


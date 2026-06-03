-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/require_mfa/alterations/alt0000001176
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/require_mfa/column


COMMENT ON COLUMN myapp_auth_private.app_settings_auth.require_mfa IS 'Whether all users are required to set up MFA';


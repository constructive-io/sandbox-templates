-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/allow_email_mfa/alterations/alt0000001182
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/allow_email_mfa/column


COMMENT ON COLUMN myapp_auth_private.app_settings_auth.allow_email_mfa IS 'Whether email code MFA is allowed';


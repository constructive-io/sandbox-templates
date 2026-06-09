-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/allow_sms_sign_in/alterations/alt0000001196
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/allow_sms_sign_in/column


COMMENT ON COLUMN myapp_auth_private.app_settings_auth.allow_sms_sign_in IS E'Whether passwordless SMS OTP sign-in is allowed';


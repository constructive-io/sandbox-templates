-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/enable_captcha/alterations/alt0000001232
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/enable_captcha/column


COMMENT ON COLUMN myapp_auth_private.app_settings_auth.enable_captcha IS E'Whether CAPTCHA verification is required on sign-up and password-reset endpoints';


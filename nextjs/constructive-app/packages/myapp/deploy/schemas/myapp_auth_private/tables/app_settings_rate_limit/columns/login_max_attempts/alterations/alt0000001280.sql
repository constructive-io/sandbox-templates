-- Deploy: schemas/myapp_auth_private/tables/app_settings_rate_limit/columns/login_max_attempts/alterations/alt0000001280
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_rate_limit/columns/login_max_attempts/column


COMMENT ON COLUMN myapp_auth_private.app_settings_rate_limit.login_max_attempts IS 'Number of consecutive failed login attempts before the account is locked';


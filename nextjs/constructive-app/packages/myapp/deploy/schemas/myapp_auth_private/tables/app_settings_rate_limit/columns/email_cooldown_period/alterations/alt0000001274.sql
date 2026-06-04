-- Deploy: schemas/myapp_auth_private/tables/app_settings_rate_limit/columns/email_cooldown_period/alterations/alt0000001274
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_rate_limit/columns/email_cooldown_period/column


COMMENT ON COLUMN myapp_auth_private.app_settings_rate_limit.email_cooldown_period IS E'Minimum time between sending emails to the same address (forgot_password, verification, etc.)';


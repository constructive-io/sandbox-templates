-- Deploy: schemas/myapp_auth_private/tables/app_settings_rate_limit/columns/ip_max_attempts/alterations/alt0000001259
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_rate_limit/columns/ip_max_attempts/column


COMMENT ON COLUMN myapp_auth_private.app_settings_rate_limit.ip_max_attempts IS 'Maximum number of attempts per IP address within the rate limit window before lockout';


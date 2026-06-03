-- Deploy: schemas/myapp_auth_private/tables/app_settings_rate_limit/columns/user_max_attempts/alterations/alt0000001268
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_rate_limit/columns/user_max_attempts/column


COMMENT ON COLUMN myapp_auth_private.app_settings_rate_limit.user_max_attempts IS E'Maximum number of attempts per user/subject within the rate limit window before lockout';


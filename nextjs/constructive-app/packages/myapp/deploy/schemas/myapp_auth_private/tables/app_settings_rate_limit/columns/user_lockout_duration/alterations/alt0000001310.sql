-- Deploy: schemas/myapp_auth_private/tables/app_settings_rate_limit/columns/user_lockout_duration/alterations/alt0000001310
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_rate_limit/columns/user_lockout_duration/column


COMMENT ON COLUMN myapp_auth_private.app_settings_rate_limit.user_lockout_duration IS E'How long a user/subject is locked out after exceeding the maximum attempts';


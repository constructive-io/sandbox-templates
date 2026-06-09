-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/default_session_duration/alterations/alt0000001139
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/default_session_duration/column


COMMENT ON COLUMN myapp_auth_private.app_settings_auth.default_session_duration IS E'How long sessions last for standard (non-remember-me) logins';


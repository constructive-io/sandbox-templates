-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/cookie_max_age/alterations/alt0000001223
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/cookie_max_age/column


COMMENT ON COLUMN myapp_auth_private.app_settings_auth.cookie_max_age IS E'Max-Age for the auth cookie; defaults to match default_session_duration';


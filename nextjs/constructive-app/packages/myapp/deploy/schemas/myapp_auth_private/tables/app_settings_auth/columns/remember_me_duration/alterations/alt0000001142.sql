-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/remember_me_duration/alterations/alt0000001142
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/remember_me_duration/column


COMMENT ON COLUMN myapp_auth_private.app_settings_auth.remember_me_duration IS 'Extended session duration when the user selects remember me during login';


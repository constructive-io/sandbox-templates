-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/cookie_path/alterations/alt0000001226
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/cookie_path/column


COMMENT ON COLUMN myapp_auth_private.app_settings_auth.cookie_path IS 'Path scope for the auth cookie';


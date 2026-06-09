-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/oauth_error_redirect_path/alterations/alt0000001245
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/oauth_error_redirect_path/column


COMMENT ON COLUMN myapp_auth_private.app_settings_auth.oauth_error_redirect_path IS 'URL path the server redirects the browser to when an OAuth flow fails';


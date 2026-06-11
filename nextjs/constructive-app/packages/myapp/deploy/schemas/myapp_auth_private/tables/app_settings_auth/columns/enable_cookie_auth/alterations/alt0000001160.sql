-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/enable_cookie_auth/alterations/alt0000001160
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/enable_cookie_auth/column


COMMENT ON COLUMN myapp_auth_private.app_settings_auth.enable_cookie_auth IS E'Whether to enable HTTP cookie-based authentication (requires CSRF protection)';


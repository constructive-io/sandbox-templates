-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/cookie_httponly/alterations/alt0000001255
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/cookie_httponly/column


COMMENT ON COLUMN myapp_auth_private.app_settings_auth.cookie_httponly IS E'Whether the auth cookie is inaccessible to client-side JavaScript (HttpOnly flag)';


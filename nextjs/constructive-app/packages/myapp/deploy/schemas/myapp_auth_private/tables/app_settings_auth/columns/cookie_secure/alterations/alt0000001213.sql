-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/cookie_secure/alterations/alt0000001213
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/cookie_secure/column


COMMENT ON COLUMN myapp_auth_private.app_settings_auth.cookie_secure IS E'Whether the auth cookie should be sent only over HTTPS (Secure flag)';


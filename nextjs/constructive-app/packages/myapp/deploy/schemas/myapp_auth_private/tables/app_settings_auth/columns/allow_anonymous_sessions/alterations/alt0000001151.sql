-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/allow_anonymous_sessions/alterations/alt0000001151
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/allow_anonymous_sessions/column


COMMENT ON COLUMN myapp_auth_private.app_settings_auth.allow_anonymous_sessions IS E'Whether to allow anonymous sessions (useful for CSRF protection and shopping carts)';


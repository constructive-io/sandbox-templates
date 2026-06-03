-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/allow_multiple_sessions/alterations/alt0000001119
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/allow_multiple_sessions/column


COMMENT ON COLUMN myapp_auth_private.app_settings_auth.allow_multiple_sessions IS 'Whether users can have multiple active sessions simultaneously';


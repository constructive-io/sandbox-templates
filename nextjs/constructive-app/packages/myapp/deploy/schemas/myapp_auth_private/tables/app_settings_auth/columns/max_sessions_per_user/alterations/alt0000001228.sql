-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/max_sessions_per_user/alterations/alt0000001228
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/max_sessions_per_user/column


COMMENT ON COLUMN myapp_auth_private.app_settings_auth.max_sessions_per_user IS E'Maximum concurrent sessions per user; NULL means unlimited';


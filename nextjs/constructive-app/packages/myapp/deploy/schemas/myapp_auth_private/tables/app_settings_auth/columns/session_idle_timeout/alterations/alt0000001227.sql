-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/session_idle_timeout/alterations/alt0000001227
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/session_idle_timeout/column


COMMENT ON COLUMN myapp_auth_private.app_settings_auth.session_idle_timeout IS E'Optional idle timeout: sessions unused for this duration are expired; NULL means no idle expiry';


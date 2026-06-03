-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/alterations/alt0000001096
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/table


COMMENT ON TABLE myapp_auth_private.app_settings_auth IS E'Singleton configuration table for authentication settings including session durations, lockout policy, and password requirements';


-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/allow_backup_codes/alterations/alt0000001188
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/allow_backup_codes/column


COMMENT ON COLUMN myapp_auth_private.app_settings_auth.allow_backup_codes IS 'Whether backup code generation is allowed';


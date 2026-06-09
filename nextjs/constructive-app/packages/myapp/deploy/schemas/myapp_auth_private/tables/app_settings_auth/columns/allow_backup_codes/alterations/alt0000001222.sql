-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/allow_backup_codes/alterations/alt0000001222
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/table
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/allow_backup_codes/column


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN allow_backup_codes SET DEFAULT true;


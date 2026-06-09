-- Revert: schemas/myapp_auth_private/tables/app_settings_auth/columns/updated_at/alterations/alt0000001274


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN updated_at DROP DEFAULT;



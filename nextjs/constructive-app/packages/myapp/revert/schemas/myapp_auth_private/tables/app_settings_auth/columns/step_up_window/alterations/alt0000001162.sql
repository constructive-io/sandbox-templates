-- Revert: schemas/myapp_auth_private/tables/app_settings_auth/columns/step_up_window/alterations/alt0000001162


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN step_up_window DROP DEFAULT;



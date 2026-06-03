-- Revert: schemas/myapp_auth_private/tables/app_settings_auth/columns/remember_me_duration/alterations/alt0000001105


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN remember_me_duration DROP NOT NULL;



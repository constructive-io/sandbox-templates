-- Revert: schemas/myapp_auth_private/tables/app_settings_auth/columns/allow_sms_mfa/alterations/alt0000001184


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN allow_sms_mfa DROP DEFAULT;



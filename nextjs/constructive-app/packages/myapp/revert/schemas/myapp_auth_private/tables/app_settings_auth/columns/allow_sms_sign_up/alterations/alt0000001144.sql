-- Revert: schemas/myapp_auth_private/tables/app_settings_auth/columns/allow_sms_sign_up/alterations/alt0000001144


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN allow_sms_sign_up DROP NOT NULL;



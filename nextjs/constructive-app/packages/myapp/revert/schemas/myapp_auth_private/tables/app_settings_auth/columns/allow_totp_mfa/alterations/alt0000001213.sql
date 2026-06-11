-- Revert: schemas/myapp_auth_private/tables/app_settings_auth/columns/allow_totp_mfa/alterations/alt0000001213


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN allow_totp_mfa DROP DEFAULT;



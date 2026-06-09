-- Revert: schemas/myapp_auth_private/tables/app_settings_auth/columns/allow_password_sign_in/alterations/alt0000001182


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN allow_password_sign_in DROP NOT NULL;



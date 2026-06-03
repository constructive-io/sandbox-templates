-- Revert: schemas/myapp_auth_private/tables/app_settings_auth/columns/enable_captcha/alterations/alt0000001230


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN enable_captcha DROP NOT NULL;



-- Revert: schemas/myapp_auth_private/tables/app_settings_auth/columns/enable_captcha/column


ALTER TABLE myapp_auth_private.app_settings_auth 
  DROP COLUMN enable_captcha RESTRICT;



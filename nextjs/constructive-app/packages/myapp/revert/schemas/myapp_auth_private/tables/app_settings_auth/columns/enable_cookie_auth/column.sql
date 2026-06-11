-- Revert: schemas/myapp_auth_private/tables/app_settings_auth/columns/enable_cookie_auth/column


ALTER TABLE myapp_auth_private.app_settings_auth 
  DROP COLUMN enable_cookie_auth RESTRICT;



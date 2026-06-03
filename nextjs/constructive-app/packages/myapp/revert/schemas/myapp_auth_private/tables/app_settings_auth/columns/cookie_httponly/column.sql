-- Revert: schemas/myapp_auth_private/tables/app_settings_auth/columns/cookie_httponly/column


ALTER TABLE myapp_auth_private.app_settings_auth 
  DROP COLUMN cookie_httponly RESTRICT;



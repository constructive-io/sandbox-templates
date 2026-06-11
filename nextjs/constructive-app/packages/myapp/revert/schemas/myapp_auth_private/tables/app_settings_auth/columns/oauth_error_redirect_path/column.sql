-- Revert: schemas/myapp_auth_private/tables/app_settings_auth/columns/oauth_error_redirect_path/column


ALTER TABLE myapp_auth_private.app_settings_auth 
  DROP COLUMN oauth_error_redirect_path RESTRICT;



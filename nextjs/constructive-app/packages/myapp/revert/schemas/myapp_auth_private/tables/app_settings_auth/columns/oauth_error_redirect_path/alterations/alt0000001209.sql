-- Revert: schemas/myapp_auth_private/tables/app_settings_auth/columns/oauth_error_redirect_path/alterations/alt0000001209


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN oauth_error_redirect_path DROP DEFAULT;



-- Revert: schemas/myapp_auth_private/tables/app_settings_auth/columns/api_key_max_per_user/column


ALTER TABLE myapp_auth_private.app_settings_auth 
  DROP COLUMN api_key_max_per_user RESTRICT;



-- Revert: schemas/myapp_auth_private/tables/app_settings_auth/columns/max_sessions_per_user/column


ALTER TABLE myapp_auth_private.app_settings_auth 
  DROP COLUMN max_sessions_per_user RESTRICT;



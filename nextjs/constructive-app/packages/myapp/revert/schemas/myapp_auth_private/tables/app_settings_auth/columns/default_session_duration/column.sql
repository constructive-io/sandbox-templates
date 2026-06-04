-- Revert: schemas/myapp_auth_private/tables/app_settings_auth/columns/default_session_duration/column


ALTER TABLE myapp_auth_private.app_settings_auth 
  DROP COLUMN default_session_duration RESTRICT;



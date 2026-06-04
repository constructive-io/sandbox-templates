-- Revert: schemas/myapp_auth_private/tables/app_settings_rate_limit/columns/login_lockout_duration/column


ALTER TABLE myapp_auth_private.app_settings_rate_limit 
  DROP COLUMN login_lockout_duration RESTRICT;



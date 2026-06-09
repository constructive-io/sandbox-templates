-- Revert: schemas/myapp_auth_private/tables/app_settings_rate_limit/columns/login_max_attempts/alterations/alt0000001318


ALTER TABLE myapp_auth_private.app_settings_rate_limit 
  ALTER COLUMN login_max_attempts DROP DEFAULT;



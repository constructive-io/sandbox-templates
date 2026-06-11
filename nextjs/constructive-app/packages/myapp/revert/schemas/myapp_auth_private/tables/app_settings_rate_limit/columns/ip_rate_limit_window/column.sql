-- Revert: schemas/myapp_auth_private/tables/app_settings_rate_limit/columns/ip_rate_limit_window/column


ALTER TABLE myapp_auth_private.app_settings_rate_limit 
  DROP COLUMN ip_rate_limit_window RESTRICT;



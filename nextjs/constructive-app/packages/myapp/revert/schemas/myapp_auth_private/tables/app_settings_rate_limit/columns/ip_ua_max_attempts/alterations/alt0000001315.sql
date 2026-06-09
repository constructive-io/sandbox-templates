-- Revert: schemas/myapp_auth_private/tables/app_settings_rate_limit/columns/ip_ua_max_attempts/alterations/alt0000001315


ALTER TABLE myapp_auth_private.app_settings_rate_limit 
  ALTER COLUMN ip_ua_max_attempts DROP DEFAULT;



-- Revert: schemas/myapp_auth_private/tables/app_settings_rate_limit/columns/ip_max_attempts/alterations/alt0000001297


ALTER TABLE myapp_auth_private.app_settings_rate_limit 
  ALTER COLUMN ip_max_attempts DROP DEFAULT;



-- Revert: schemas/myapp_auth_private/tables/app_settings_rate_limit/columns/ip_lockout_duration/alterations/alt0000001260


ALTER TABLE myapp_auth_private.app_settings_rate_limit 
  ALTER COLUMN ip_lockout_duration DROP NOT NULL;



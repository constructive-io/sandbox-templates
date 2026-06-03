-- Revert: schemas/myapp_auth_private/tables/app_settings_rate_limit/constraints/app_settings_rate_limits_pkey/constraint


ALTER TABLE myapp_auth_private.app_settings_rate_limit 
  DROP CONSTRAINT app_settings_rate_limits_pkey;



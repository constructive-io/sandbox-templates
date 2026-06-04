-- Revert: schemas/myapp_auth_private/tables/app_settings_rate_limit/policies/enable_row_level_security


ALTER TABLE myapp_auth_private.app_settings_rate_limit 
  DISABLE ROW LEVEL SECURITY;



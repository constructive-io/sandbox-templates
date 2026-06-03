-- Revert: schemas/myapp_auth_private/tables/app_settings_auth/policies/enable_row_level_security


ALTER TABLE myapp_auth_private.app_settings_auth 
  DISABLE ROW LEVEL SECURITY;



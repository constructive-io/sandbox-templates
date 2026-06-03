-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/policies/enable_row_level_security
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/table


ALTER TABLE myapp_auth_private.app_settings_auth 
  ENABLE ROW LEVEL SECURITY;


-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/alterations/alt0000001130
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/table


ALTER TABLE myapp_auth_private.app_settings_auth 
  DISABLE ROW LEVEL SECURITY;


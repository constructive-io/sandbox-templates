-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/cookie_secure/alterations/alt0000001247
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/table
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/cookie_secure/column


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN cookie_secure SET DEFAULT true;


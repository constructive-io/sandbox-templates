-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/enable_cookie_auth/alterations/alt0000001158
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/table
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/enable_cookie_auth/column


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN enable_cookie_auth SET NOT NULL;


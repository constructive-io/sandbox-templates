-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/cookie_max_age/alterations/alt0000001221
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/table
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/cookie_max_age/column


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN cookie_max_age SET NOT NULL;


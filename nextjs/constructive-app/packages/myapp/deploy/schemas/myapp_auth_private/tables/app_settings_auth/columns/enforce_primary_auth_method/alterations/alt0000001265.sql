-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/enforce_primary_auth_method/alterations/alt0000001265
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/table
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/enforce_primary_auth_method/column


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN enforce_primary_auth_method SET NOT NULL;


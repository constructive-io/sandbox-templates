-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/id/alterations/alt0000001132
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/table
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/id/column


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN id SET NOT NULL;


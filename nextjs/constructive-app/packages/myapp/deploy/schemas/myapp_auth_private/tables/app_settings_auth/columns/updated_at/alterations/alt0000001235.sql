-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/updated_at/alterations/alt0000001235
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/table
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/updated_at/column


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN updated_at SET DEFAULT now();


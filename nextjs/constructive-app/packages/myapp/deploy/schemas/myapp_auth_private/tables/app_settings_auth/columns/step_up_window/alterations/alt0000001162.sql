-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/step_up_window/alterations/alt0000001162
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/table
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/step_up_window/column


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN step_up_window SET DEFAULT '30 minutes'::interval;


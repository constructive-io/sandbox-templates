-- Revert: schemas/myapp_auth_private/tables/app_settings_auth/columns/id/alterations/alt0000001132


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN id DROP NOT NULL;



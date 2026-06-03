-- Revert: schemas/myapp_auth_private/tables/app_settings_auth/columns/updated_at/column


ALTER TABLE myapp_auth_private.app_settings_auth 
  DROP COLUMN updated_at RESTRICT;



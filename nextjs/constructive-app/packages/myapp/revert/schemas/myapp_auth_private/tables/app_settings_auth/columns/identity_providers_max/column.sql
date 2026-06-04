-- Revert: schemas/myapp_auth_private/tables/app_settings_auth/columns/identity_providers_max/column


ALTER TABLE myapp_auth_private.app_settings_auth 
  DROP COLUMN identity_providers_max RESTRICT;



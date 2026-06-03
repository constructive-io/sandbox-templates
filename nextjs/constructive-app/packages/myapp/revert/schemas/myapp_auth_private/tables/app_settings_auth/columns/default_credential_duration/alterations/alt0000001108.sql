-- Revert: schemas/myapp_auth_private/tables/app_settings_auth/columns/default_credential_duration/alterations/alt0000001108


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN default_credential_duration DROP NOT NULL;



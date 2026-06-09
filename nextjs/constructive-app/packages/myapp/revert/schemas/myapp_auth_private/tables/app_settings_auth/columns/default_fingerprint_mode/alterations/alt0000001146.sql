-- Revert: schemas/myapp_auth_private/tables/app_settings_auth/columns/default_fingerprint_mode/alterations/alt0000001146


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN default_fingerprint_mode DROP NOT NULL;



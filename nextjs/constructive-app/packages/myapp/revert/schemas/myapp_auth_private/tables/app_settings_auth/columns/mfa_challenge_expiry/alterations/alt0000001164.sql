-- Revert: schemas/myapp_auth_private/tables/app_settings_auth/columns/mfa_challenge_expiry/alterations/alt0000001164


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN mfa_challenge_expiry DROP NOT NULL;



-- Revert: schemas/myapp_auth_private/tables/session_credentials/columns/mfa_level/alterations/alt0000001088


ALTER TABLE myapp_auth_private.session_credentials 
  ALTER COLUMN mfa_level DROP DEFAULT;



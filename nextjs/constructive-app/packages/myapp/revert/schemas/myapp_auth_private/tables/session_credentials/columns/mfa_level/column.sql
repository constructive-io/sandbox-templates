-- Revert: schemas/myapp_auth_private/tables/session_credentials/columns/mfa_level/column


ALTER TABLE myapp_auth_private.session_credentials 
  DROP COLUMN mfa_level RESTRICT;



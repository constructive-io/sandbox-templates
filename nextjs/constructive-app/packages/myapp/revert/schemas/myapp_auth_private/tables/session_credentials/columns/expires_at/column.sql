-- Revert: schemas/myapp_auth_private/tables/session_credentials/columns/expires_at/column


ALTER TABLE myapp_auth_private.session_credentials 
  DROP COLUMN expires_at RESTRICT;



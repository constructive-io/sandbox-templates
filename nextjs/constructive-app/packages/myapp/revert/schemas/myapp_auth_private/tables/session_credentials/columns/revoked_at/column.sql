-- Revert: schemas/myapp_auth_private/tables/session_credentials/columns/revoked_at/column


ALTER TABLE myapp_auth_private.session_credentials 
  DROP COLUMN revoked_at RESTRICT;



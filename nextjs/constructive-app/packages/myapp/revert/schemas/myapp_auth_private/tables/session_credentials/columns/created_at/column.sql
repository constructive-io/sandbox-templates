-- Revert: schemas/myapp_auth_private/tables/session_credentials/columns/created_at/column


ALTER TABLE myapp_auth_private.session_credentials 
  DROP COLUMN created_at RESTRICT;



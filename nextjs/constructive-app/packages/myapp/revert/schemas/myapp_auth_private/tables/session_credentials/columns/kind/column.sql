-- Revert: schemas/myapp_auth_private/tables/session_credentials/columns/kind/column


ALTER TABLE myapp_auth_private.session_credentials 
  DROP COLUMN kind RESTRICT;



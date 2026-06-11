-- Revert: schemas/myapp_auth_private/tables/session_credentials/columns/id/alterations/alt0000001107


ALTER TABLE myapp_auth_private.session_credentials 
  ALTER COLUMN id DROP DEFAULT;



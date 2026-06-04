-- Revert: schemas/myapp_auth_private/tables/session_credentials/columns/created_at/alterations/alt0000001093


ALTER TABLE myapp_auth_private.session_credentials 
  ALTER COLUMN created_at DROP DEFAULT;



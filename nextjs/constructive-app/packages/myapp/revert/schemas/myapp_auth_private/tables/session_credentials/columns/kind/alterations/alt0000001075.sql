-- Revert: schemas/myapp_auth_private/tables/session_credentials/columns/kind/alterations/alt0000001075


ALTER TABLE myapp_auth_private.session_credentials 
  ALTER COLUMN kind DROP NOT NULL;



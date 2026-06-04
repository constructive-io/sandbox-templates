-- Revert: schemas/myapp_auth_private/tables/session_secrets/columns/name/alterations/alt0000001243


ALTER TABLE myapp_auth_private.session_secrets 
  ALTER COLUMN name DROP NOT NULL;



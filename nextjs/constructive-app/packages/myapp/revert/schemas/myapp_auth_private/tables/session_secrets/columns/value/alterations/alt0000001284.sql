-- Revert: schemas/myapp_auth_private/tables/session_secrets/columns/value/alterations/alt0000001284


ALTER TABLE myapp_auth_private.session_secrets 
  ALTER COLUMN value DROP NOT NULL;



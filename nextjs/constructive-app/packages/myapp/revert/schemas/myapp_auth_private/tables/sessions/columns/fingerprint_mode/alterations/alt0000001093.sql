-- Revert: schemas/myapp_auth_private/tables/sessions/columns/fingerprint_mode/alterations/alt0000001093


ALTER TABLE myapp_auth_private.sessions 
  ALTER COLUMN fingerprint_mode DROP NOT NULL;



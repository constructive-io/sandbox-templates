-- Revert: schemas/myapp_auth_private/tables/sessions/columns/fingerprint_mode/column


ALTER TABLE myapp_auth_private.sessions 
  DROP COLUMN fingerprint_mode RESTRICT;



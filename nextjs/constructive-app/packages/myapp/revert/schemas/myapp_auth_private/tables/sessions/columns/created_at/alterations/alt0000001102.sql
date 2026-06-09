-- Revert: schemas/myapp_auth_private/tables/sessions/columns/created_at/alterations/alt0000001102


ALTER TABLE myapp_auth_private.sessions 
  ALTER COLUMN created_at DROP DEFAULT;



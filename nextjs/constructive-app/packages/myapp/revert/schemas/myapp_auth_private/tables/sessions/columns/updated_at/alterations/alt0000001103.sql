-- Revert: schemas/myapp_auth_private/tables/sessions/columns/updated_at/alterations/alt0000001103


ALTER TABLE myapp_auth_private.sessions 
  ALTER COLUMN updated_at DROP DEFAULT;



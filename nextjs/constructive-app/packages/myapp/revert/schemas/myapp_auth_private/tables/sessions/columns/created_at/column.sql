-- Revert: schemas/myapp_auth_private/tables/sessions/columns/created_at/column


ALTER TABLE myapp_auth_private.sessions 
  DROP COLUMN created_at RESTRICT;



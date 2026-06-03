-- Revert: schemas/myapp_auth_private/tables/sessions/columns/updated_at/column


ALTER TABLE myapp_auth_private.sessions 
  DROP COLUMN updated_at RESTRICT;



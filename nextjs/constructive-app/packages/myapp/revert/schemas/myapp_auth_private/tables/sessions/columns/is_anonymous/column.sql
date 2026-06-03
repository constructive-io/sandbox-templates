-- Revert: schemas/myapp_auth_private/tables/sessions/columns/is_anonymous/column


ALTER TABLE myapp_auth_private.sessions 
  DROP COLUMN is_anonymous RESTRICT;



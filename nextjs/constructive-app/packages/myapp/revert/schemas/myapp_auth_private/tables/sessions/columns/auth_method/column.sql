-- Revert: schemas/myapp_auth_private/tables/sessions/columns/auth_method/column


ALTER TABLE myapp_auth_private.sessions 
  DROP COLUMN auth_method RESTRICT;



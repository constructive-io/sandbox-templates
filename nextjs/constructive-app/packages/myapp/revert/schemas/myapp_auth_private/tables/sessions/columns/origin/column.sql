-- Revert: schemas/myapp_auth_private/tables/sessions/columns/origin/column


ALTER TABLE myapp_auth_private.sessions 
  DROP COLUMN origin RESTRICT;



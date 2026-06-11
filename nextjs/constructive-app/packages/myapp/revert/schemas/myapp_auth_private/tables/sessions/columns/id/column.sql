-- Revert: schemas/myapp_auth_private/tables/sessions/columns/id/column


ALTER TABLE myapp_auth_private.sessions 
  DROP COLUMN id RESTRICT;



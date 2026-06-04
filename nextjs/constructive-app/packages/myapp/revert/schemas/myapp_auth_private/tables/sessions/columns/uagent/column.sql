-- Revert: schemas/myapp_auth_private/tables/sessions/columns/uagent/column


ALTER TABLE myapp_auth_private.sessions 
  DROP COLUMN uagent RESTRICT;



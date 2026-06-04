-- Revert: schemas/myapp_auth_private/tables/sessions/columns/uagent/alterations/alt0000001056


ALTER TABLE myapp_auth_private.sessions 
  ALTER COLUMN uagent DROP DEFAULT;



-- Revert: schemas/myapp_auth_private/tables/session_secrets/columns/value/column


ALTER TABLE myapp_auth_private.session_secrets 
  DROP COLUMN value RESTRICT;



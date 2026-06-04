-- Revert: schemas/myapp_auth_private/tables/sessions/columns/ip/column


ALTER TABLE myapp_auth_private.sessions 
  DROP COLUMN ip RESTRICT;



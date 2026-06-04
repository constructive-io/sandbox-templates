-- Revert: schemas/myapp_auth_private/tables/sessions/columns/expires_at/column


ALTER TABLE myapp_auth_private.sessions 
  DROP COLUMN expires_at RESTRICT;



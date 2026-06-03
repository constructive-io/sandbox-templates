-- Revert: schemas/myapp_auth_private/tables/sessions/columns/revoked_at/column


ALTER TABLE myapp_auth_private.sessions 
  DROP COLUMN revoked_at RESTRICT;



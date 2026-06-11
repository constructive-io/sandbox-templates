-- Revert: schemas/myapp_auth_private/tables/session_secrets/columns/created_at/column


ALTER TABLE myapp_auth_private.session_secrets 
  DROP COLUMN created_at RESTRICT;



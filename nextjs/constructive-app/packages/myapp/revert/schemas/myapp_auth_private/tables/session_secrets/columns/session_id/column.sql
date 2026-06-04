-- Revert: schemas/myapp_auth_private/tables/session_secrets/columns/session_id/column


ALTER TABLE myapp_auth_private.session_secrets 
  DROP COLUMN session_id RESTRICT;



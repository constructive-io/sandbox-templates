-- Revert: schemas/myapp_auth_private/tables/session_credentials/columns/session_id/column


ALTER TABLE myapp_auth_private.session_credentials 
  DROP COLUMN session_id RESTRICT;



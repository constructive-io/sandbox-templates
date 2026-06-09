-- Revert: schemas/myapp_auth_private/tables/session_secrets/columns/session_id/alterations/alt0000001281


ALTER TABLE myapp_auth_private.session_secrets 
  ALTER COLUMN session_id DROP DEFAULT;



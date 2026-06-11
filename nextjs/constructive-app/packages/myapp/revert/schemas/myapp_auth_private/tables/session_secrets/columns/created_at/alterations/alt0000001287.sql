-- Revert: schemas/myapp_auth_private/tables/session_secrets/columns/created_at/alterations/alt0000001287


ALTER TABLE myapp_auth_private.session_secrets 
  ALTER COLUMN created_at DROP DEFAULT;



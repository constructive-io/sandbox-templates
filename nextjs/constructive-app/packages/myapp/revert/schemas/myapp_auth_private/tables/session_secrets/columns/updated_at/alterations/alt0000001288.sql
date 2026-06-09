-- Revert: schemas/myapp_auth_private/tables/session_secrets/columns/updated_at/alterations/alt0000001288


ALTER TABLE myapp_auth_private.session_secrets 
  ALTER COLUMN updated_at DROP DEFAULT;



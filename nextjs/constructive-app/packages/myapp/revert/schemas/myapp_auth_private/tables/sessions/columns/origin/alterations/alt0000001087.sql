-- Revert: schemas/myapp_auth_private/tables/sessions/columns/origin/alterations/alt0000001087


ALTER TABLE myapp_auth_private.sessions 
  ALTER COLUMN origin DROP DEFAULT;



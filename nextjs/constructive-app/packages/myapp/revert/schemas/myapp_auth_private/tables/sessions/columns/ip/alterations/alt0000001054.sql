-- Revert: schemas/myapp_auth_private/tables/sessions/columns/ip/alterations/alt0000001054


ALTER TABLE myapp_auth_private.sessions 
  ALTER COLUMN ip DROP DEFAULT;



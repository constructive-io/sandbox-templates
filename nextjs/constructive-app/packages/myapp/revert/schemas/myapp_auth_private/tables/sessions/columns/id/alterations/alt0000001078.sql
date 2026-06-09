-- Revert: schemas/myapp_auth_private/tables/sessions/columns/id/alterations/alt0000001078


ALTER TABLE myapp_auth_private.sessions 
  ALTER COLUMN id DROP DEFAULT;



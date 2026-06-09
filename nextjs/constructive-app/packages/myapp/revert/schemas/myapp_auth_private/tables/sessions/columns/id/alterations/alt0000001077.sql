-- Revert: schemas/myapp_auth_private/tables/sessions/columns/id/alterations/alt0000001077


ALTER TABLE myapp_auth_private.sessions 
  ALTER COLUMN id DROP NOT NULL;



-- Revert: schemas/myapp_auth_private/tables/sessions/columns/is_anonymous/alterations/alt0000001045


ALTER TABLE myapp_auth_private.sessions 
  ALTER COLUMN is_anonymous DROP NOT NULL;



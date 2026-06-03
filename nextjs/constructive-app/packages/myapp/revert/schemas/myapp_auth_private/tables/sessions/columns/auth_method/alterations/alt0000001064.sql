-- Revert: schemas/myapp_auth_private/tables/sessions/columns/auth_method/alterations/alt0000001064


ALTER TABLE myapp_auth_private.sessions 
  ALTER COLUMN auth_method DROP NOT NULL;



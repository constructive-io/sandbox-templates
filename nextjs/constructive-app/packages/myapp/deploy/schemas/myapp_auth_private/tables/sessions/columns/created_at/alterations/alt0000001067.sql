-- Deploy: schemas/myapp_auth_private/tables/sessions/columns/created_at/alterations/alt0000001067
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/sessions/table
-- requires: schemas/myapp_auth_private/tables/sessions/columns/created_at/column


ALTER TABLE myapp_auth_private.sessions 
  ALTER COLUMN created_at SET DEFAULT now();


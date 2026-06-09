-- Deploy: schemas/myapp_auth_private/tables/sessions/alterations/alt0000001075
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/sessions/table


ALTER TABLE myapp_auth_private.sessions 
  DISABLE ROW LEVEL SECURITY;


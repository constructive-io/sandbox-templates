-- Deploy: schemas/myapp_auth_private/tables/session_secrets/alterations/alt0000001276
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/session_secrets/table


ALTER TABLE myapp_auth_private.session_secrets 
  DISABLE ROW LEVEL SECURITY;


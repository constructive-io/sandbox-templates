-- Deploy: schemas/myapp_auth_private/tables/session_credentials/alterations/alt0000001069
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/session_credentials/table


ALTER TABLE myapp_auth_private.session_credentials 
  DISABLE ROW LEVEL SECURITY;


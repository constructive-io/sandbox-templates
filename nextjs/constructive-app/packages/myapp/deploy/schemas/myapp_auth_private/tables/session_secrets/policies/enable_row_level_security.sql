-- Deploy: schemas/myapp_auth_private/tables/session_secrets/policies/enable_row_level_security
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/session_secrets/table


ALTER TABLE myapp_auth_private.session_secrets 
  ENABLE ROW LEVEL SECURITY;


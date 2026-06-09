-- Deploy: schemas/myapp_auth_private/tables/session_credentials/columns/created_at/alterations/alt0000001128
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/session_credentials/table
-- requires: schemas/myapp_auth_private/tables/session_credentials/columns/created_at/column


ALTER TABLE myapp_auth_private.session_credentials 
  ALTER COLUMN created_at SET DEFAULT now();


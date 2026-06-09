-- Deploy: schemas/myapp_auth_private/tables/session_credentials/columns/secret_hash/alterations/alt0000001114
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/session_credentials/table
-- requires: schemas/myapp_auth_private/tables/session_credentials/columns/secret_hash/column


ALTER TABLE myapp_auth_private.session_credentials 
  ALTER COLUMN secret_hash SET NOT NULL;


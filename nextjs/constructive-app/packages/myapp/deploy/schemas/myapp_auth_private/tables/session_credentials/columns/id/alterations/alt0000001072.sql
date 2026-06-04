-- Deploy: schemas/myapp_auth_private/tables/session_credentials/columns/id/alterations/alt0000001072
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/session_credentials/table
-- requires: schemas/myapp_auth_private/tables/session_credentials/columns/id/column


ALTER TABLE myapp_auth_private.session_credentials 
  ALTER COLUMN id SET DEFAULT uuidv7();


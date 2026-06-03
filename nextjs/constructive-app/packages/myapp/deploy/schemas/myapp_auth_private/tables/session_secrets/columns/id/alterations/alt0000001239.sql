-- Deploy: schemas/myapp_auth_private/tables/session_secrets/columns/id/alterations/alt0000001239
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/session_secrets/table
-- requires: schemas/myapp_auth_private/tables/session_secrets/columns/id/column


ALTER TABLE myapp_auth_private.session_secrets 
  ALTER COLUMN id SET NOT NULL;


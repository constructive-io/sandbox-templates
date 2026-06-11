-- Deploy: schemas/myapp_auth_private/tables/session_secrets/columns/name/alterations/alt0000001282
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/session_secrets/table
-- requires: schemas/myapp_auth_private/tables/session_secrets/columns/name/column


ALTER TABLE myapp_auth_private.session_secrets 
  ALTER COLUMN name SET NOT NULL;


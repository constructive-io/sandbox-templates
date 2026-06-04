-- Deploy: schemas/myapp_auth_private/tables/session_secrets/columns/value/alterations/alt0000001245
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/session_secrets/table
-- requires: schemas/myapp_auth_private/tables/session_secrets/columns/value/column


ALTER TABLE myapp_auth_private.session_secrets 
  ALTER COLUMN value SET NOT NULL;


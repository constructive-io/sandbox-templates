-- Deploy: schemas/myapp_auth_private/tables/session_secrets/columns/session_id/alterations/alt0000001241
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/session_secrets/table
-- requires: schemas/myapp_auth_private/tables/session_secrets/columns/session_id/column


ALTER TABLE myapp_auth_private.session_secrets 
  ALTER COLUMN session_id SET NOT NULL;


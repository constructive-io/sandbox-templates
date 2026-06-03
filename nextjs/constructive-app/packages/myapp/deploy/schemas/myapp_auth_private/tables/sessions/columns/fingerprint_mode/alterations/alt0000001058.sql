-- Deploy: schemas/myapp_auth_private/tables/sessions/columns/fingerprint_mode/alterations/alt0000001058
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/sessions/table
-- requires: schemas/myapp_auth_private/tables/sessions/columns/fingerprint_mode/column


ALTER TABLE myapp_auth_private.sessions 
  ALTER COLUMN fingerprint_mode SET NOT NULL;


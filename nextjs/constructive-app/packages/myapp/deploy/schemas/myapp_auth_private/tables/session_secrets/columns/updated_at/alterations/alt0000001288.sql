-- Deploy: schemas/myapp_auth_private/tables/session_secrets/columns/updated_at/alterations/alt0000001288
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/session_secrets/table
-- requires: schemas/myapp_auth_private/tables/session_secrets/columns/updated_at/column


ALTER TABLE myapp_auth_private.session_secrets 
  ALTER COLUMN updated_at SET DEFAULT now();


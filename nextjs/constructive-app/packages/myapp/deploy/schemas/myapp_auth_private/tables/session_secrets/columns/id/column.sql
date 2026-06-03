-- Deploy: schemas/myapp_auth_private/tables/session_secrets/columns/id/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/session_secrets/table


ALTER TABLE myapp_auth_private.session_secrets 
  ADD COLUMN id uuid;


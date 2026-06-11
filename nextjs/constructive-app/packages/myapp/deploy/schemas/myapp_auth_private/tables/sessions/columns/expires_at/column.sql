-- Deploy: schemas/myapp_auth_private/tables/sessions/columns/expires_at/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/sessions/table


ALTER TABLE myapp_auth_private.sessions 
  ADD COLUMN expires_at timestamptz;


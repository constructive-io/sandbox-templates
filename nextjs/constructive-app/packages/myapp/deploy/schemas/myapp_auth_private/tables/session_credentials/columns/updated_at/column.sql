-- Deploy: schemas/myapp_auth_private/tables/session_credentials/columns/updated_at/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/session_credentials/table


ALTER TABLE myapp_auth_private.session_credentials 
  ADD COLUMN updated_at timestamptz;


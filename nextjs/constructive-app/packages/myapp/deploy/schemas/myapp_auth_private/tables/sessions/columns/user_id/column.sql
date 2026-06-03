-- Deploy: schemas/myapp_auth_private/tables/sessions/columns/user_id/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/sessions/table


ALTER TABLE myapp_auth_private.sessions 
  ADD COLUMN user_id uuid;


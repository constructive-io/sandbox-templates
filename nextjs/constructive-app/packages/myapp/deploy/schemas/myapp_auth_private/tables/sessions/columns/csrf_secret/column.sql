-- Deploy: schemas/myapp_auth_private/tables/sessions/columns/csrf_secret/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/sessions/table


ALTER TABLE myapp_auth_private.sessions 
  ADD COLUMN csrf_secret text;


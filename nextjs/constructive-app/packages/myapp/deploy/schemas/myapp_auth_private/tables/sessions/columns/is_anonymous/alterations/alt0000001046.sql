-- Deploy: schemas/myapp_auth_private/tables/sessions/columns/is_anonymous/alterations/alt0000001046
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/sessions/table
-- requires: schemas/myapp_auth_private/tables/sessions/columns/is_anonymous/column


ALTER TABLE myapp_auth_private.sessions 
  ALTER COLUMN is_anonymous SET DEFAULT false;


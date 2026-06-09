-- Deploy: schemas/myapp_auth_private/tables/sessions/columns/id/alterations/alt0000001077
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/sessions/table
-- requires: schemas/myapp_auth_private/tables/sessions/columns/id/column


ALTER TABLE myapp_auth_private.sessions 
  ALTER COLUMN id SET NOT NULL;


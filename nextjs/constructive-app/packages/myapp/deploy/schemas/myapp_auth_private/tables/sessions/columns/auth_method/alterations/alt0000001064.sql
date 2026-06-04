-- Deploy: schemas/myapp_auth_private/tables/sessions/columns/auth_method/alterations/alt0000001064
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/sessions/table
-- requires: schemas/myapp_auth_private/tables/sessions/columns/auth_method/column


ALTER TABLE myapp_auth_private.sessions 
  ALTER COLUMN auth_method SET NOT NULL;


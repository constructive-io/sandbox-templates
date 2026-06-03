-- Deploy: schemas/myapp_auth_private/tables/sessions/columns/origin/alterations/alt0000001052
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/sessions/table
-- requires: schemas/myapp_auth_private/tables/sessions/columns/origin/column


ALTER TABLE myapp_auth_private.sessions 
  ALTER COLUMN origin SET DEFAULT jwt_public.current_origin();


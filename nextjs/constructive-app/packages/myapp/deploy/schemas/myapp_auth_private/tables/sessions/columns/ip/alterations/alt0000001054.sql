-- Deploy: schemas/myapp_auth_private/tables/sessions/columns/ip/alterations/alt0000001054
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/sessions/table
-- requires: schemas/myapp_auth_private/tables/sessions/columns/ip/column


ALTER TABLE myapp_auth_private.sessions 
  ALTER COLUMN ip SET DEFAULT jwt_public.current_ip_address();


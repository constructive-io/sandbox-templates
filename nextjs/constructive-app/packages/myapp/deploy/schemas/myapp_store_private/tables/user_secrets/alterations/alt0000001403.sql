-- Deploy: schemas/myapp_store_private/tables/user_secrets/alterations/alt0000001403
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/user_secrets/table


ALTER TABLE myapp_store_private.user_secrets 
  DISABLE ROW LEVEL SECURITY;


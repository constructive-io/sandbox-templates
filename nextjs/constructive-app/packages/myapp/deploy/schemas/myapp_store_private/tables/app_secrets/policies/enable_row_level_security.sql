-- Deploy: schemas/myapp_store_private/tables/app_secrets/policies/enable_row_level_security
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/app_secrets/table


ALTER TABLE myapp_store_private.app_secrets 
  ENABLE ROW LEVEL SECURITY;


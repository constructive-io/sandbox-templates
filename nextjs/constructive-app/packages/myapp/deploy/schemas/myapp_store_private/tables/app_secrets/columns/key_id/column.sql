-- Deploy: schemas/myapp_store_private/tables/app_secrets/columns/key_id/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/app_secrets/table


ALTER TABLE myapp_store_private.app_secrets 
  ADD COLUMN key_id uuid;


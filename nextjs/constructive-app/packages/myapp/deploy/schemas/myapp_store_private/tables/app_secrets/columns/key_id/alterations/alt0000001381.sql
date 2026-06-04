-- Deploy: schemas/myapp_store_private/tables/app_secrets/columns/key_id/alterations/alt0000001381
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/app_secrets/table
-- requires: schemas/myapp_store_private/tables/app_secrets/columns/key_id/column


ALTER TABLE myapp_store_private.app_secrets 
  ALTER COLUMN key_id SET NOT NULL;


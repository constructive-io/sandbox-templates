-- Deploy: schemas/myapp_store_private/tables/app_secrets/columns/name/alterations/alt0000001386
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/app_secrets/table
-- requires: schemas/myapp_store_private/tables/app_secrets/columns/name/column


ALTER TABLE myapp_store_private.app_secrets 
  ALTER COLUMN name SET NOT NULL;


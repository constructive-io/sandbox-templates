-- Deploy: schemas/myapp_store_private/tables/app_secrets/columns/labels/alterations/alt0000001430
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/app_secrets/table
-- requires: schemas/myapp_store_private/tables/app_secrets/columns/labels/column


ALTER TABLE myapp_store_private.app_secrets 
  ALTER COLUMN labels SET NOT NULL;


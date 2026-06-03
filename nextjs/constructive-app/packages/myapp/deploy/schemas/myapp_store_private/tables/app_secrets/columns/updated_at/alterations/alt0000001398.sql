-- Deploy: schemas/myapp_store_private/tables/app_secrets/columns/updated_at/alterations/alt0000001398
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/app_secrets/table
-- requires: schemas/myapp_store_private/tables/app_secrets/columns/updated_at/column


ALTER TABLE myapp_store_private.app_secrets 
  ALTER COLUMN updated_at SET DEFAULT now();


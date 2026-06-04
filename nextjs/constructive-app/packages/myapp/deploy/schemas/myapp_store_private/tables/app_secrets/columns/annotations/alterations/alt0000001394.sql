-- Deploy: schemas/myapp_store_private/tables/app_secrets/columns/annotations/alterations/alt0000001394
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/app_secrets/table
-- requires: schemas/myapp_store_private/tables/app_secrets/columns/annotations/column


ALTER TABLE myapp_store_private.app_secrets 
  ALTER COLUMN annotations SET DEFAULT '{}'::jsonb;


-- Deploy: schemas/myapp_store_public/tables/app_config/columns/annotations/alterations/alt0000001453
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_public/schema
-- requires: schemas/myapp_store_public/tables/app_config/table
-- requires: schemas/myapp_store_public/tables/app_config/columns/annotations/column


ALTER TABLE myapp_store_public.app_config 
  ALTER COLUMN annotations SET DEFAULT '{}'::jsonb;


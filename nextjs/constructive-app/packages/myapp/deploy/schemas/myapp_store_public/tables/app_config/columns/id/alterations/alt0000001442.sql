-- Deploy: schemas/myapp_store_public/tables/app_config/columns/id/alterations/alt0000001442
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_public/schema
-- requires: schemas/myapp_store_public/tables/app_config/table
-- requires: schemas/myapp_store_public/tables/app_config/columns/id/column


ALTER TABLE myapp_store_public.app_config 
  ALTER COLUMN id SET DEFAULT uuidv7();


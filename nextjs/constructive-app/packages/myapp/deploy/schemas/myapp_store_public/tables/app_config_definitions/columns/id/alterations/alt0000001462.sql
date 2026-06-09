-- Deploy: schemas/myapp_store_public/tables/app_config_definitions/columns/id/alterations/alt0000001462
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_public/schema
-- requires: schemas/myapp_store_public/tables/app_config_definitions/table
-- requires: schemas/myapp_store_public/tables/app_config_definitions/columns/id/column


ALTER TABLE myapp_store_public.app_config_definitions 
  ALTER COLUMN id SET DEFAULT uuidv7();


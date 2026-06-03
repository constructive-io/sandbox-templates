-- Deploy: schemas/myapp_store_public/tables/app_config_definitions/columns/annotations/alterations/alt0000001436
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_public/schema
-- requires: schemas/myapp_store_public/tables/app_config_definitions/table
-- requires: schemas/myapp_store_public/tables/app_config_definitions/columns/annotations/column


ALTER TABLE myapp_store_public.app_config_definitions 
  ALTER COLUMN annotations SET NOT NULL;


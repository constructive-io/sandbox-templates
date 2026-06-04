-- Deploy: schemas/myapp_store_public/tables/app_config_definitions/columns/labels/alterations/alt0000001433
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_public/schema
-- requires: schemas/myapp_store_public/tables/app_config_definitions/table
-- requires: schemas/myapp_store_public/tables/app_config_definitions/columns/labels/column


ALTER TABLE myapp_store_public.app_config_definitions 
  ALTER COLUMN labels SET NOT NULL;


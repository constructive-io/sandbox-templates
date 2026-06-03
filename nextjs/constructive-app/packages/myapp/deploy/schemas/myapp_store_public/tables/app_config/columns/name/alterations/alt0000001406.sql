-- Deploy: schemas/myapp_store_public/tables/app_config/columns/name/alterations/alt0000001406
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_public/schema
-- requires: schemas/myapp_store_public/tables/app_config/table
-- requires: schemas/myapp_store_public/tables/app_config/columns/name/column


ALTER TABLE myapp_store_public.app_config 
  ALTER COLUMN name SET NOT NULL;


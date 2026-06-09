-- Deploy: schemas/myapp_store_public/tables/app_config/columns/labels/alterations/alt0000001450
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_public/schema
-- requires: schemas/myapp_store_public/tables/app_config/table
-- requires: schemas/myapp_store_public/tables/app_config/columns/labels/column


ALTER TABLE myapp_store_public.app_config 
  ALTER COLUMN labels SET DEFAULT '{}'::jsonb;


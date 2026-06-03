-- Deploy: schemas/myapp_store_public/tables/app_config/columns/namespace_id/alterations/alt0000001404
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_public/schema
-- requires: schemas/myapp_store_public/tables/app_config/table
-- requires: schemas/myapp_store_public/tables/app_config/columns/namespace_id/column


ALTER TABLE myapp_store_public.app_config 
  ALTER COLUMN namespace_id SET NOT NULL;


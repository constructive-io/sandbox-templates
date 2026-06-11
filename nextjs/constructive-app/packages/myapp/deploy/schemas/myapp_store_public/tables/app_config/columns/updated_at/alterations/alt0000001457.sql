-- Deploy: schemas/myapp_store_public/tables/app_config/columns/updated_at/alterations/alt0000001457
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_public/schema
-- requires: schemas/myapp_store_public/tables/app_config/table
-- requires: schemas/myapp_store_public/tables/app_config/columns/updated_at/column


ALTER TABLE myapp_store_public.app_config 
  ALTER COLUMN updated_at SET DEFAULT now();


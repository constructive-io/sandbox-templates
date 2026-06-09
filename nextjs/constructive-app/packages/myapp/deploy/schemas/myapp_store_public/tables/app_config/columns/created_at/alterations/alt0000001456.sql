-- Deploy: schemas/myapp_store_public/tables/app_config/columns/created_at/alterations/alt0000001456
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_public/schema
-- requires: schemas/myapp_store_public/tables/app_config/table
-- requires: schemas/myapp_store_public/tables/app_config/columns/created_at/column


ALTER TABLE myapp_store_public.app_config 
  ALTER COLUMN created_at SET DEFAULT now();


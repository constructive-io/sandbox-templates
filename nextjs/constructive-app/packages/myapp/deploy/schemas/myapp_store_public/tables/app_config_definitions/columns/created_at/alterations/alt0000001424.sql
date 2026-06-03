-- Deploy: schemas/myapp_store_public/tables/app_config_definitions/columns/created_at/alterations/alt0000001424
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_public/schema
-- requires: schemas/myapp_store_public/tables/app_config_definitions/table
-- requires: schemas/myapp_store_public/tables/app_config_definitions/columns/created_at/column


ALTER TABLE myapp_store_public.app_config_definitions 
  ALTER COLUMN created_at SET DEFAULT now();


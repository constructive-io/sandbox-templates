-- Deploy: schemas/myapp_store_public/tables/app_config_definitions/columns/is_built_in/alterations/alt0000001471
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_public/schema
-- requires: schemas/myapp_store_public/tables/app_config_definitions/table
-- requires: schemas/myapp_store_public/tables/app_config_definitions/columns/is_built_in/column


ALTER TABLE myapp_store_public.app_config_definitions 
  ALTER COLUMN is_built_in SET DEFAULT false;


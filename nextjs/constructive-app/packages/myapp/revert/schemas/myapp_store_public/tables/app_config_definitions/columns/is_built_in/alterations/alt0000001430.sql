-- Revert: schemas/myapp_store_public/tables/app_config_definitions/columns/is_built_in/alterations/alt0000001430


ALTER TABLE myapp_store_public.app_config_definitions 
  ALTER COLUMN is_built_in DROP NOT NULL;



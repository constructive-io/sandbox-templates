-- Revert: schemas/myapp_store_public/tables/app_config_definitions/columns/is_built_in/column


ALTER TABLE myapp_store_public.app_config_definitions 
  DROP COLUMN is_built_in RESTRICT;



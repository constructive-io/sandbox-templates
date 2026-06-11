-- Revert: schemas/myapp_store_public/tables/app_config_definitions/constraints/app_config_definitions_name_key/constraint


ALTER TABLE myapp_store_public.app_config_definitions 
  DROP CONSTRAINT app_config_definitions_name_key;



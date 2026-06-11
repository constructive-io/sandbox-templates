-- Revert: schemas/myapp_store_public/tables/app_config_definitions/columns/name/alterations/alt0000001466


ALTER TABLE myapp_store_public.app_config_definitions 
  ALTER COLUMN name DROP NOT NULL;



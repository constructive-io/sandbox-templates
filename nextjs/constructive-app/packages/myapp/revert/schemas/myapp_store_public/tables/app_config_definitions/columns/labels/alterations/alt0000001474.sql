-- Revert: schemas/myapp_store_public/tables/app_config_definitions/columns/labels/alterations/alt0000001474


ALTER TABLE myapp_store_public.app_config_definitions 
  ALTER COLUMN labels DROP DEFAULT;



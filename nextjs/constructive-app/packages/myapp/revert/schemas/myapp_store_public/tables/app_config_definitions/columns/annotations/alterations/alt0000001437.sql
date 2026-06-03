-- Revert: schemas/myapp_store_public/tables/app_config_definitions/columns/annotations/alterations/alt0000001437


ALTER TABLE myapp_store_public.app_config_definitions 
  ALTER COLUMN annotations DROP DEFAULT;



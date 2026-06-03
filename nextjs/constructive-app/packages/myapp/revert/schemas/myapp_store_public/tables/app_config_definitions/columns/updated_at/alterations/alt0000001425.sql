-- Revert: schemas/myapp_store_public/tables/app_config_definitions/columns/updated_at/alterations/alt0000001425


ALTER TABLE myapp_store_public.app_config_definitions 
  ALTER COLUMN updated_at DROP DEFAULT;



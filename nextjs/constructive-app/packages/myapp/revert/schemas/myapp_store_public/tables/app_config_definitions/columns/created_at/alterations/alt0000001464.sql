-- Revert: schemas/myapp_store_public/tables/app_config_definitions/columns/created_at/alterations/alt0000001464


ALTER TABLE myapp_store_public.app_config_definitions 
  ALTER COLUMN created_at DROP DEFAULT;



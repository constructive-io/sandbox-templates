-- Revert: schemas/myapp_store_public/tables/app_config/columns/name/alterations/alt0000001446


ALTER TABLE myapp_store_public.app_config 
  ALTER COLUMN name DROP NOT NULL;



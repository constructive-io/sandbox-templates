-- Revert: schemas/myapp_store_public/tables/app_config/columns/updated_at/alterations/alt0000001417


ALTER TABLE myapp_store_public.app_config 
  ALTER COLUMN updated_at DROP DEFAULT;



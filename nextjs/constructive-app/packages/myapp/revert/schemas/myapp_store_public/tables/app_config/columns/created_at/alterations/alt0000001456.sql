-- Revert: schemas/myapp_store_public/tables/app_config/columns/created_at/alterations/alt0000001456


ALTER TABLE myapp_store_public.app_config 
  ALTER COLUMN created_at DROP DEFAULT;



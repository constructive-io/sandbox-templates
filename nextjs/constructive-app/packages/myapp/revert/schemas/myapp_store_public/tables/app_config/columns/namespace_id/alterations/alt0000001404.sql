-- Revert: schemas/myapp_store_public/tables/app_config/columns/namespace_id/alterations/alt0000001404


ALTER TABLE myapp_store_public.app_config 
  ALTER COLUMN namespace_id DROP NOT NULL;



-- Revert: schemas/myapp_store_public/tables/app_config/columns/annotations/alterations/alt0000001452


ALTER TABLE myapp_store_public.app_config 
  ALTER COLUMN annotations DROP NOT NULL;



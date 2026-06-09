-- Revert: schemas/myapp_store_public/tables/app_config/columns/labels/alterations/alt0000001449


ALTER TABLE myapp_store_public.app_config 
  ALTER COLUMN labels DROP NOT NULL;



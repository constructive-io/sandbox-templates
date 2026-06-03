-- Revert: schemas/myapp_store_public/tables/app_config/columns/id/alterations/alt0000001401


ALTER TABLE myapp_store_public.app_config 
  ALTER COLUMN id DROP NOT NULL;



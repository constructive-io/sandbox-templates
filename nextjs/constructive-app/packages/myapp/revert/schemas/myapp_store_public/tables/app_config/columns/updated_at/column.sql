-- Revert: schemas/myapp_store_public/tables/app_config/columns/updated_at/column


ALTER TABLE myapp_store_public.app_config 
  DROP COLUMN updated_at RESTRICT;



-- Revert: schemas/myapp_store_public/tables/app_config/columns/created_at/column


ALTER TABLE myapp_store_public.app_config 
  DROP COLUMN created_at RESTRICT;



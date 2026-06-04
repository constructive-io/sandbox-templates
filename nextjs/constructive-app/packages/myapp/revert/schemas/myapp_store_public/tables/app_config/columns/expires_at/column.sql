-- Revert: schemas/myapp_store_public/tables/app_config/columns/expires_at/column


ALTER TABLE myapp_store_public.app_config 
  DROP COLUMN expires_at RESTRICT;



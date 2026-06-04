-- Revert: schemas/myapp_store_public/tables/app_config/columns/id/column


ALTER TABLE myapp_store_public.app_config 
  DROP COLUMN id RESTRICT;



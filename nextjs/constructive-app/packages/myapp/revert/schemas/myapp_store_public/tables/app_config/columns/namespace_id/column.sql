-- Revert: schemas/myapp_store_public/tables/app_config/columns/namespace_id/column


ALTER TABLE myapp_store_public.app_config 
  DROP COLUMN namespace_id RESTRICT;



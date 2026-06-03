-- Revert: schemas/myapp_store_public/tables/app_config_definitions/columns/id/column


ALTER TABLE myapp_store_public.app_config_definitions 
  DROP COLUMN id RESTRICT;



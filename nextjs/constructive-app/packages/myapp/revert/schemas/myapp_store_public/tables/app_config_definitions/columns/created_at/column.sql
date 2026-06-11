-- Revert: schemas/myapp_store_public/tables/app_config_definitions/columns/created_at/column


ALTER TABLE myapp_store_public.app_config_definitions 
  DROP COLUMN created_at RESTRICT;



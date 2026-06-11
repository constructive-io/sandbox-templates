-- Revert: schemas/myapp_store_public/tables/app_config/constraints/app_configs_namespace_id_fkey/constraint


ALTER TABLE myapp_store_public.app_config 
  DROP CONSTRAINT app_configs_namespace_id_fkey;



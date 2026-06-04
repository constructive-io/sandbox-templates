-- Deploy: schemas/myapp_store_public/tables/app_config/constraints/app_configs_namespace_id_name_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_public/schema
-- requires: schemas/myapp_store_public/tables/app_config/table


ALTER TABLE myapp_store_public.app_config 
  ADD CONSTRAINT app_configs_namespace_id_name_key 
    UNIQUE (namespace_id, name);


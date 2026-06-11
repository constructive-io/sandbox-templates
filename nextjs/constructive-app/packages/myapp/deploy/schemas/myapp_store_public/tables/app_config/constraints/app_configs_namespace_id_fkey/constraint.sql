-- Deploy: schemas/myapp_store_public/tables/app_config/constraints/app_configs_namespace_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_store_public/schema
-- requires: schemas/myapp_store_public/tables/app_config/table
-- requires: schemas/myapp_infra_public/tables/app_namespaces/table


ALTER TABLE myapp_store_public.app_config 
  ADD CONSTRAINT app_configs_namespace_id_fkey 
    FOREIGN KEY(namespace_id) 
    REFERENCES myapp_infra_public.app_namespaces (id) 
    ON DELETE RESTRICT;


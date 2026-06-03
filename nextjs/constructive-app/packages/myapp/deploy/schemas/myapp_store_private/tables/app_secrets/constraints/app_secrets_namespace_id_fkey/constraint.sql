-- Deploy: schemas/myapp_store_private/tables/app_secrets/constraints/app_secrets_namespace_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/app_secrets/table
-- requires: schemas/myapp_infra_public/tables/app_namespaces/table


ALTER TABLE myapp_store_private.app_secrets 
  ADD CONSTRAINT app_secrets_namespace_id_fkey 
    FOREIGN KEY(namespace_id) 
    REFERENCES myapp_infra_public.app_namespaces (id) 
    ON DELETE RESTRICT;


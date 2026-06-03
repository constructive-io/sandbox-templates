-- Deploy: schemas/myapp_infra_public/tables/app_namespaces/columns/is_active/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespaces/table


ALTER TABLE myapp_infra_public.app_namespaces 
  ADD COLUMN is_active boolean;


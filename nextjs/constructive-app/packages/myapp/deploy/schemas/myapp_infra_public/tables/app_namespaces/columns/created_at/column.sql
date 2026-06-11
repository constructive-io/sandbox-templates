-- Deploy: schemas/myapp_infra_public/tables/app_namespaces/columns/created_at/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespaces/table


ALTER TABLE myapp_infra_public.app_namespaces 
  ADD COLUMN created_at timestamptz;


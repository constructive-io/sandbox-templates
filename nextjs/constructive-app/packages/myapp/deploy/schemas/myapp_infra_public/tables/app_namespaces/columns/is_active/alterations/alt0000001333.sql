-- Deploy: schemas/myapp_infra_public/tables/app_namespaces/columns/is_active/alterations/alt0000001333
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespaces/table
-- requires: schemas/myapp_infra_public/tables/app_namespaces/columns/is_active/column


ALTER TABLE myapp_infra_public.app_namespaces 
  ALTER COLUMN is_active SET DEFAULT true;


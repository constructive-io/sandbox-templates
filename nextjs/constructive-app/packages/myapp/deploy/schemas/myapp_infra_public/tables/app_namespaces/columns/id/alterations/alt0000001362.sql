-- Deploy: schemas/myapp_infra_public/tables/app_namespaces/columns/id/alterations/alt0000001362
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespaces/table
-- requires: schemas/myapp_infra_public/tables/app_namespaces/columns/id/column


ALTER TABLE myapp_infra_public.app_namespaces 
  ALTER COLUMN id SET NOT NULL;


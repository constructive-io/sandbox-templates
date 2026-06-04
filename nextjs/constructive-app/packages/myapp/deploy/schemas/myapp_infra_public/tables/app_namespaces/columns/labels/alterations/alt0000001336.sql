-- Deploy: schemas/myapp_infra_public/tables/app_namespaces/columns/labels/alterations/alt0000001336
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespaces/table
-- requires: schemas/myapp_infra_public/tables/app_namespaces/columns/labels/column


ALTER TABLE myapp_infra_public.app_namespaces 
  ALTER COLUMN labels SET DEFAULT '{}'::jsonb;


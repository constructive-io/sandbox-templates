-- Deploy: schemas/myapp_infra_public/tables/app_namespaces/columns/namespace_name/alterations/alt0000001368
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespaces/table
-- requires: schemas/myapp_infra_public/tables/app_namespaces/columns/namespace_name/column


ALTER TABLE myapp_infra_public.app_namespaces 
  ALTER COLUMN namespace_name SET NOT NULL;


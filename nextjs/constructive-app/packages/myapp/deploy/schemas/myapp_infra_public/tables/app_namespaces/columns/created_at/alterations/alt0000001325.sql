-- Deploy: schemas/myapp_infra_public/tables/app_namespaces/columns/created_at/alterations/alt0000001325
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespaces/table
-- requires: schemas/myapp_infra_public/tables/app_namespaces/columns/created_at/column


ALTER TABLE myapp_infra_public.app_namespaces 
  ALTER COLUMN created_at SET DEFAULT now();


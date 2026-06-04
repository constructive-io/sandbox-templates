-- Deploy: schemas/myapp_infra_public/tables/app_namespaces/columns/updated_at/alterations/alt0000001326
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespaces/table
-- requires: schemas/myapp_infra_public/tables/app_namespaces/columns/updated_at/column


ALTER TABLE myapp_infra_public.app_namespaces 
  ALTER COLUMN updated_at SET DEFAULT now();


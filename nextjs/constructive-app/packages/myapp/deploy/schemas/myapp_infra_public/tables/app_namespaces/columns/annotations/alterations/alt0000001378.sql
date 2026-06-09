-- Deploy: schemas/myapp_infra_public/tables/app_namespaces/columns/annotations/alterations/alt0000001378
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespaces/table
-- requires: schemas/myapp_infra_public/tables/app_namespaces/columns/annotations/column


ALTER TABLE myapp_infra_public.app_namespaces 
  ALTER COLUMN annotations SET DEFAULT '{}'::jsonb;


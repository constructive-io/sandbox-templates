-- Deploy: schemas/myapp_infra_public/tables/app_namespaces/alterations/alt0000001360
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespaces/table


ALTER TABLE myapp_infra_public.app_namespaces 
  DISABLE ROW LEVEL SECURITY;


-- Deploy: schemas/myapp_infra_public/tables/app_namespace_events/alterations/alt0000001380
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespace_events/table


ALTER TABLE myapp_infra_public.app_namespace_events 
  DISABLE ROW LEVEL SECURITY;


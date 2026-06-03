-- Deploy: schemas/myapp_infra_public/tables/app_namespace_events/policies/enable_row_level_security
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespace_events/table


ALTER TABLE myapp_infra_public.app_namespace_events 
  ENABLE ROW LEVEL SECURITY;


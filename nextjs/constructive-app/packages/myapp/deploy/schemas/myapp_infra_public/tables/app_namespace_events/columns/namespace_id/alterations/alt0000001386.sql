-- Deploy: schemas/myapp_infra_public/tables/app_namespace_events/columns/namespace_id/alterations/alt0000001386
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespace_events/table
-- requires: schemas/myapp_infra_public/tables/app_namespace_events/columns/namespace_id/column


ALTER TABLE myapp_infra_public.app_namespace_events 
  ALTER COLUMN namespace_id SET NOT NULL;


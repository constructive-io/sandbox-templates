-- Deploy: schemas/myapp_infra_public/tables/app_namespace_events/columns/event_type/alterations/alt0000001388
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespace_events/table
-- requires: schemas/myapp_infra_public/tables/app_namespace_events/columns/event_type/column


ALTER TABLE myapp_infra_public.app_namespace_events 
  ALTER COLUMN event_type SET NOT NULL;


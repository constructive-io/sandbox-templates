-- Deploy: schemas/myapp_infra_public/tables/app_namespace_events/columns/storage_bytes/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespace_events/table


ALTER TABLE myapp_infra_public.app_namespace_events 
  ADD COLUMN storage_bytes bigint;


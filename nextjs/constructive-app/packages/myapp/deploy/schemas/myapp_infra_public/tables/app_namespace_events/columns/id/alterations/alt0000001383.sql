-- Deploy: schemas/myapp_infra_public/tables/app_namespace_events/columns/id/alterations/alt0000001383
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespace_events/table
-- requires: schemas/myapp_infra_public/tables/app_namespace_events/columns/id/column


ALTER TABLE myapp_infra_public.app_namespace_events 
  ALTER COLUMN id SET DEFAULT uuidv7();


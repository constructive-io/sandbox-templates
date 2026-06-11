-- Deploy: schemas/myapp_infra_public/tables/app_namespace_events/columns/namespace_id/alterations/alt0000001387
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespace_events/columns/namespace_id/column


COMMENT ON COLUMN myapp_infra_public.app_namespace_events.namespace_id IS 'Namespace this event belongs to';


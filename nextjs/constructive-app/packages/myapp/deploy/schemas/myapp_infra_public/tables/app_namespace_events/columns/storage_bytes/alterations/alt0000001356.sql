-- Deploy: schemas/myapp_infra_public/tables/app_namespace_events/columns/storage_bytes/alterations/alt0000001356
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespace_events/columns/storage_bytes/column


COMMENT ON COLUMN myapp_infra_public.app_namespace_events.storage_bytes IS 'Storage usage in bytes at time of event';


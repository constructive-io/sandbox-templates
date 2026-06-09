-- Deploy: schemas/myapp_infra_public/tables/app_namespace_events/columns/created_at/alterations/alt0000001385
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespace_events/columns/created_at/column


COMMENT ON COLUMN myapp_infra_public.app_namespace_events.created_at IS E'Event timestamp (partition key)';


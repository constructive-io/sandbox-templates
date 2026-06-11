-- Deploy: schemas/myapp_infra_public/tables/app_namespace_events/columns/metrics/alterations/alt0000001399
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespace_events/columns/metrics/column


COMMENT ON COLUMN myapp_infra_public.app_namespace_events.metrics IS E'Additional resource metrics (gpu, replicas, quotas, etc.)';


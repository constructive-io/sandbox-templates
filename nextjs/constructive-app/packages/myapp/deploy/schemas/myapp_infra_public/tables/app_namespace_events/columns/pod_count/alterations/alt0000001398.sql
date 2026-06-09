-- Deploy: schemas/myapp_infra_public/tables/app_namespace_events/columns/pod_count/alterations/alt0000001398
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespace_events/columns/pod_count/column


COMMENT ON COLUMN myapp_infra_public.app_namespace_events.pod_count IS 'Number of active pods in the namespace at time of event';


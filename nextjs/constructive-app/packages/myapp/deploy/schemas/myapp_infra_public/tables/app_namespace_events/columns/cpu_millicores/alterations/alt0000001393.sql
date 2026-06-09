-- Deploy: schemas/myapp_infra_public/tables/app_namespace_events/columns/cpu_millicores/alterations/alt0000001393
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespace_events/columns/cpu_millicores/column


COMMENT ON COLUMN myapp_infra_public.app_namespace_events.cpu_millicores IS 'CPU usage in millicores at time of event';


-- Deploy: schemas/myapp_infra_public/tables/app_namespace_events/columns/network_egress_bytes/alterations/alt0000001358
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespace_events/columns/network_egress_bytes/column


COMMENT ON COLUMN myapp_infra_public.app_namespace_events.network_egress_bytes IS 'Network egress in bytes during event window';


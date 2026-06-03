-- Deploy: schemas/myapp_infra_public/tables/app_namespace_events/columns/network_ingress_bytes/alterations/alt0000001357
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespace_events/columns/network_ingress_bytes/column


COMMENT ON COLUMN myapp_infra_public.app_namespace_events.network_ingress_bytes IS 'Network ingress in bytes during event window';


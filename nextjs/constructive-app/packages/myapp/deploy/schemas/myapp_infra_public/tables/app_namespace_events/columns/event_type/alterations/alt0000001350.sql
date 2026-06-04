-- Deploy: schemas/myapp_infra_public/tables/app_namespace_events/columns/event_type/alterations/alt0000001350
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespace_events/columns/event_type/column


COMMENT ON COLUMN myapp_infra_public.app_namespace_events.event_type IS E'Event type: created, activated, deactivated, labels_updated, annotations_updated, renamed';


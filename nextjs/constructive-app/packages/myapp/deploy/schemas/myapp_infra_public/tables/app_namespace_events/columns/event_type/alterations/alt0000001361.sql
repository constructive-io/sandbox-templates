-- Deploy: schemas/myapp_infra_public/tables/app_namespace_events/columns/event_type/alterations/alt0000001361
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespace_events/table
-- requires: schemas/myapp_infra_public/tables/app_namespace_events/columns/event_type/column


ALTER TABLE myapp_infra_public.app_namespace_events 
  ADD CONSTRAINT app_namespace_events_event_type_chk 
    CHECK (event_type IN ( 'created', 'activated', 'deactivated', 'labels_updated', 'annotations_updated', 'renamed', 'deleted', 'metrics_snapshot', 'scaled', 'quota_exceeded', 'resource_warning' ));


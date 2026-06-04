-- Deploy: schemas/myapp_events_public/tables/org_event_aggregates/columns/organization_id/alterations/alt0000000892
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_event_aggregates/columns/organization_id/column


COMMENT ON COLUMN myapp_events_public.org_event_aggregates.organization_id IS E'Resolved billable organization via get_organization_id';


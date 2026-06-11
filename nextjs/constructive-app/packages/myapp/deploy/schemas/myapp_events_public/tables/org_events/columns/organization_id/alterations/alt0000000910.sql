-- Deploy: schemas/myapp_events_public/tables/org_events/columns/organization_id/alterations/alt0000000910
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_events/columns/organization_id/column


COMMENT ON COLUMN myapp_events_public.org_events.organization_id IS E'Resolved billable organization via get_organization_id; NULL when entity_id IS the org';


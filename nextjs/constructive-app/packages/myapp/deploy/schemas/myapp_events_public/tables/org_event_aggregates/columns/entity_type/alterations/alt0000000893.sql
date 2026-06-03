-- Deploy: schemas/myapp_events_public/tables/org_event_aggregates/columns/entity_type/alterations/alt0000000893
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_event_aggregates/columns/entity_type/column


COMMENT ON COLUMN myapp_events_public.org_event_aggregates.entity_type IS E'Entity type prefix (org, team, app, etc.) for interpreting entity_id';


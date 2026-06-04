-- Deploy: schemas/myapp_events_public/tables/org_events/columns/entity_type/alterations/alt0000000878
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_events/columns/entity_type/column


COMMENT ON COLUMN myapp_events_public.org_events.entity_type IS E'Entity type prefix (org, team, app, etc.) for interpreting entity_id';


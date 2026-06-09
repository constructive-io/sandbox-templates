-- Deploy: schemas/myapp_events_public/tables/org_events/columns/id/alterations/alt0000000901
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_events/columns/id/column


COMMENT ON COLUMN myapp_events_public.org_events.id IS E'Unique identifier for each event (uuidv7 provides temporal ordering)';


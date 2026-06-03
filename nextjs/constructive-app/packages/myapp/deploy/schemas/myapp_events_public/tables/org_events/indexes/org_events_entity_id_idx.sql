-- Deploy: schemas/myapp_events_public/tables/org_events/indexes/org_events_entity_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_events/table
-- requires: schemas/myapp_events_public/tables/org_events/columns/entity_id/column


CREATE INDEX org_events_entity_id_idx ON myapp_events_public.org_events USING BTREE ( entity_id );


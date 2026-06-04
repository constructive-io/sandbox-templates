-- Deploy: schemas/myapp_events_public/tables/org_event_types/indexes/org_event_types_entity_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_event_types/table
-- requires: schemas/myapp_events_public/tables/org_event_types/columns/entity_id/column


CREATE INDEX org_event_types_entity_id_idx ON myapp_events_public.org_event_types USING BTREE ( entity_id );


-- Deploy: schemas/myapp_events_public/tables/org_level_requirements/indexes/org_level_requirements_entity_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_level_requirements/table
-- requires: schemas/myapp_events_public/tables/org_level_requirements/columns/entity_id/column


CREATE INDEX org_level_requirements_entity_id_idx ON myapp_events_public.org_level_requirements USING BTREE ( entity_id );


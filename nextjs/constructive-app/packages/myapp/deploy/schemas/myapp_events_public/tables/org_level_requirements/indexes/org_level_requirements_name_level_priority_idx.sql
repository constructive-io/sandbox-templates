-- Deploy: schemas/myapp_events_public/tables/org_level_requirements/indexes/org_level_requirements_name_level_priority_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_level_requirements/table
-- requires: schemas/myapp_events_public/tables/org_level_requirements/columns/name/column
-- requires: schemas/myapp_events_public/tables/org_level_requirements/columns/level/column
-- requires: schemas/myapp_events_public/tables/org_level_requirements/columns/priority/column


CREATE INDEX org_level_requirements_name_level_priority_idx ON myapp_events_public.org_level_requirements USING BTREE ( name, level, priority );


-- Deploy: schemas/myapp_events_public/tables/org_levels/indexes/org_levels_created_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_levels/table
-- requires: schemas/myapp_events_public/tables/org_levels/columns/created_at/column


CREATE INDEX org_levels_created_at_idx ON myapp_events_public.org_levels ( created_at );


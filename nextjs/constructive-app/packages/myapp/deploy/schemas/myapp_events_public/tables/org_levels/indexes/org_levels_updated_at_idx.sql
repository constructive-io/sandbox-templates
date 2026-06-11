-- Deploy: schemas/myapp_events_public/tables/org_levels/indexes/org_levels_updated_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_levels/table
-- requires: schemas/myapp_events_public/tables/org_levels/columns/updated_at/column


CREATE INDEX org_levels_updated_at_idx ON myapp_events_public.org_levels ( updated_at );


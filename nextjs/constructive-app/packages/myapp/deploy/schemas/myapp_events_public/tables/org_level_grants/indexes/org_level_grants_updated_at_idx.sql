-- Deploy: schemas/myapp_events_public/tables/org_level_grants/indexes/org_level_grants_updated_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_level_grants/table
-- requires: schemas/myapp_events_public/tables/org_level_grants/columns/updated_at/column


CREATE INDEX org_level_grants_updated_at_idx ON myapp_events_public.org_level_grants ( updated_at );


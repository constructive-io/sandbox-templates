-- Deploy: schemas/myapp_events_public/tables/app_levels/indexes/app_levels_updated_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_levels/table
-- requires: schemas/myapp_events_public/tables/app_levels/columns/updated_at/column


CREATE INDEX app_levels_updated_at_idx ON myapp_events_public.app_levels ( updated_at );


-- Deploy: schemas/myapp_events_public/tables/app_level_grants/indexes/app_level_grants_updated_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_level_grants/table
-- requires: schemas/myapp_events_public/tables/app_level_grants/columns/updated_at/column


CREATE INDEX app_level_grants_updated_at_idx ON myapp_events_public.app_level_grants ( updated_at );


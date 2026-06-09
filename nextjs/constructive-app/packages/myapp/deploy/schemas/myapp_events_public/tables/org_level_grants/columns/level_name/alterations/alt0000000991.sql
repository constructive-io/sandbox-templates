-- Deploy: schemas/myapp_events_public/tables/org_level_grants/columns/level_name/alterations/alt0000000991
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_level_grants/columns/level_name/column


COMMENT ON COLUMN myapp_events_public.org_level_grants.level_name IS 'Name of the level that was achieved';


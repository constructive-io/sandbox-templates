-- Deploy: schemas/myapp_events_public/tables/app_levels/columns/owner_id/alterations/alt0000000357
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_levels/columns/owner_id/column


COMMENT ON COLUMN myapp_events_public.app_levels.owner_id IS E'Optional owner (actor) who created or manages this level';


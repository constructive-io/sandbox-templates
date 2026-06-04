-- Deploy: schemas/myapp_events_public/tables/app_event_aggregates/columns/name/alterations/alt0000000301
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_event_aggregates/columns/name/column


COMMENT ON COLUMN myapp_events_public.app_event_aggregates.name IS 'Name identifier of the level requirement being tracked';


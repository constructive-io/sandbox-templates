-- Deploy: schemas/myapp_events_public/tables/app_event_aggregates/columns/count/alterations/alt0000000304
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_event_aggregates/columns/count/column


COMMENT ON COLUMN myapp_events_public.app_event_aggregates.count IS 'Cumulative count of completed steps toward this requirement';


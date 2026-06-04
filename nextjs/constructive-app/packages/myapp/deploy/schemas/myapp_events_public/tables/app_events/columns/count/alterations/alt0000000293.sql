-- Deploy: schemas/myapp_events_public/tables/app_events/columns/count/alterations/alt0000000293
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_events/columns/count/column


COMMENT ON COLUMN myapp_events_public.app_events.count IS 'Number of units completed in this step action';


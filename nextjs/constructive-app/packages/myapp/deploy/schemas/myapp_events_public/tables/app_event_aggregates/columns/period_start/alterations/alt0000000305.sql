-- Deploy: schemas/myapp_events_public/tables/app_event_aggregates/columns/period_start/alterations/alt0000000305
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_event_aggregates/columns/period_start/column


COMMENT ON COLUMN myapp_events_public.app_event_aggregates.period_start IS E'Start of current counting period; NULL means lifetime counting';


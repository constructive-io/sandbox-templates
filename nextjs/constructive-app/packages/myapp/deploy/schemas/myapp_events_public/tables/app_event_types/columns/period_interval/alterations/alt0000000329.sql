-- Deploy: schemas/myapp_events_public/tables/app_event_types/columns/period_interval/alterations/alt0000000329
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_event_types/columns/period_interval/column


COMMENT ON COLUMN myapp_events_public.app_event_types.period_interval IS E'Optional period for aggregate count reset; NULL means lifetime counting';


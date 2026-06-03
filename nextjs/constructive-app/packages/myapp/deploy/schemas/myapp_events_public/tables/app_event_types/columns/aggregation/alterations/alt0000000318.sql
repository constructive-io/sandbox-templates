-- Deploy: schemas/myapp_events_public/tables/app_event_types/columns/aggregation/alterations/alt0000000318
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_event_types/columns/aggregation/column


COMMENT ON COLUMN myapp_events_public.app_event_types.aggregation IS E'Aggregation mode: count, sum, last_value, or none';


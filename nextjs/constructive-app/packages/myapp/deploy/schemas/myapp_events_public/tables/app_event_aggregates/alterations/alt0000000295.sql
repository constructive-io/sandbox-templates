-- Deploy: schemas/myapp_events_public/tables/app_event_aggregates/alterations/alt0000000295
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_event_aggregates/table


COMMENT ON TABLE myapp_events_public.app_event_aggregates IS E'Aggregated user progress for level requirements, tallying the total count; updated via triggers and should not be modified manually';


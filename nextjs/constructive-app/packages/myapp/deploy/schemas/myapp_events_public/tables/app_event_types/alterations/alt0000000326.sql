-- Deploy: schemas/myapp_events_public/tables/app_event_types/alterations/alt0000000326
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_event_types/table


COMMENT ON TABLE myapp_events_public.app_event_types IS E'Catalog of known event types with per-type configuration for aggregation, retention, and level participation';


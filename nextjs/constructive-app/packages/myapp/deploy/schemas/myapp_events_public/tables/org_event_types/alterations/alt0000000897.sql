-- Deploy: schemas/myapp_events_public/tables/org_event_types/alterations/alt0000000897
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_event_types/table


COMMENT ON TABLE myapp_events_public.org_event_types IS E'Catalog of known event types with per-type configuration for aggregation, retention, and level participation';


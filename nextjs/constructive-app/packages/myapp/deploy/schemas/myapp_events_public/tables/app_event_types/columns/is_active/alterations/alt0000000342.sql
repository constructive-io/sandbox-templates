-- Deploy: schemas/myapp_events_public/tables/app_event_types/columns/is_active/alterations/alt0000000342
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_event_types/columns/is_active/column


COMMENT ON COLUMN myapp_events_public.app_event_types.is_active IS 'Whether recording of this event type is enabled';


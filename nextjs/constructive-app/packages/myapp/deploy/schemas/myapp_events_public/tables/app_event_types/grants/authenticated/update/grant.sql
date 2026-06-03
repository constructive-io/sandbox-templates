-- Deploy: schemas/myapp_events_public/tables/app_event_types/grants/authenticated/update/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_event_types/table


GRANT UPDATE ON myapp_events_public.app_event_types TO authenticated;


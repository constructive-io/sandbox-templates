-- Deploy: schemas/myapp_events_public/tables/org_event_types/grants/authenticated/select/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_event_types/table


GRANT SELECT ON myapp_events_public.org_event_types TO authenticated;


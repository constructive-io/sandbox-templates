-- Deploy: schemas/myapp_events_public/tables/org_event_aggregates/grants/authenticated/insert/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_event_aggregates/table


GRANT INSERT ON myapp_events_public.org_event_aggregates TO authenticated;


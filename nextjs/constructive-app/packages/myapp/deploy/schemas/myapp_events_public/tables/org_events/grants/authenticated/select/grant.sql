-- Deploy: schemas/myapp_events_public/tables/org_events/grants/authenticated/select/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_events/table


GRANT SELECT ON myapp_events_public.org_events TO authenticated;


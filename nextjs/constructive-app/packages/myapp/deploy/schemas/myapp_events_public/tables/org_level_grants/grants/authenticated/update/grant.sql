-- Deploy: schemas/myapp_events_public/tables/org_level_grants/grants/authenticated/update/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_level_grants/table


GRANT UPDATE ON myapp_events_public.org_level_grants TO authenticated;


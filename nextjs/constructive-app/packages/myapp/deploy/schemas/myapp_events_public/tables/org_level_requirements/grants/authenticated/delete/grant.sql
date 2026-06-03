-- Deploy: schemas/myapp_events_public/tables/org_level_requirements/grants/authenticated/delete/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_level_requirements/table


GRANT DELETE ON myapp_events_public.org_level_requirements TO authenticated;


-- Deploy: schemas/myapp_events_public/tables/org_levels/grants/authenticated/delete/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_levels/table


GRANT DELETE ON myapp_events_public.org_levels TO authenticated;


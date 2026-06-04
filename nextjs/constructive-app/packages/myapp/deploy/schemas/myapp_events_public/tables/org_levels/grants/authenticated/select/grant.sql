-- Deploy: schemas/myapp_events_public/tables/org_levels/grants/authenticated/select/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_levels/table


GRANT SELECT ON myapp_events_public.org_levels TO authenticated;


-- Deploy: schemas/myapp_events_public/tables/app_levels/grants/authenticated/insert/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_levels/table


GRANT INSERT ON myapp_events_public.app_levels TO authenticated;


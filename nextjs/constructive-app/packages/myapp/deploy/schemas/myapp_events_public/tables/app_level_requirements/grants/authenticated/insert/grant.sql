-- Deploy: schemas/myapp_events_public/tables/app_level_requirements/grants/authenticated/insert/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_level_requirements/table


GRANT INSERT ON myapp_events_public.app_level_requirements TO authenticated;


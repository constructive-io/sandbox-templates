-- Deploy: schemas/myapp_events_public/tables/app_level_requirements/grants/authenticated/delete/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_level_requirements/table


GRANT DELETE ON myapp_events_public.app_level_requirements TO authenticated;


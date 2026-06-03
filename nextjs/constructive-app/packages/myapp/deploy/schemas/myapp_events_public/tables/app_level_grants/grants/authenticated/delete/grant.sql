-- Deploy: schemas/myapp_events_public/tables/app_level_grants/grants/authenticated/delete/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_level_grants/table


GRANT DELETE ON myapp_events_public.app_level_grants TO authenticated;


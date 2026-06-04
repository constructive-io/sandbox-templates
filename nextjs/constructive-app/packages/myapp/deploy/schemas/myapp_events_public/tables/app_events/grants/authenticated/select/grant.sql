-- Deploy: schemas/myapp_events_public/tables/app_events/grants/authenticated/select/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_events/table


GRANT SELECT ON myapp_events_public.app_events TO authenticated;


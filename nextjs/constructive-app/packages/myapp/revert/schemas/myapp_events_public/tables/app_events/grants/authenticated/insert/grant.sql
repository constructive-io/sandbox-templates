-- Revert: schemas/myapp_events_public/tables/app_events/grants/authenticated/insert/grant


REVOKE INSERT ON myapp_events_public.app_events FROM authenticated;



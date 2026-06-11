-- Revert: schemas/myapp_events_public/tables/app_event_types/grants/authenticated/insert/grant


REVOKE INSERT ON myapp_events_public.app_event_types FROM authenticated;



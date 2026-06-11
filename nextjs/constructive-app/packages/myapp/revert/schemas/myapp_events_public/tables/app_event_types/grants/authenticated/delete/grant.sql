-- Revert: schemas/myapp_events_public/tables/app_event_types/grants/authenticated/delete/grant


REVOKE DELETE ON myapp_events_public.app_event_types FROM authenticated;



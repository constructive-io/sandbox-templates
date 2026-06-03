-- Revert: schemas/myapp_events_public/tables/app_event_types/grants/authenticated/select/grant


REVOKE SELECT ON myapp_events_public.app_event_types FROM authenticated;



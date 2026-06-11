-- Revert: schemas/myapp_events_public/tables/app_events/grants/authenticated/delete/grant


REVOKE DELETE ON myapp_events_public.app_events FROM authenticated;



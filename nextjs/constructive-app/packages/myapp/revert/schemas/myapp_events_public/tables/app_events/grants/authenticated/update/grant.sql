-- Revert: schemas/myapp_events_public/tables/app_events/grants/authenticated/update/grant


REVOKE UPDATE ON myapp_events_public.app_events FROM authenticated;



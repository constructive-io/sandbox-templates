-- Revert: schemas/myapp_events_public/tables/app_events/grants/authenticated/select/grant


REVOKE SELECT ON myapp_events_public.app_events FROM authenticated;



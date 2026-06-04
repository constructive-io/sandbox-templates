-- Revert: schemas/myapp_events_public/tables/app_level_grants/grants/authenticated/delete/grant


REVOKE DELETE ON myapp_events_public.app_level_grants FROM authenticated;



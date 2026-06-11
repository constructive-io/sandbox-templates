-- Revert: schemas/myapp_events_public/tables/app_levels/grants/authenticated/delete/grant


REVOKE DELETE ON myapp_events_public.app_levels FROM authenticated;



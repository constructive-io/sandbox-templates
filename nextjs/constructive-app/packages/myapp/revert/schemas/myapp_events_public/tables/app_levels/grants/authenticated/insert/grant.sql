-- Revert: schemas/myapp_events_public/tables/app_levels/grants/authenticated/insert/grant


REVOKE INSERT ON myapp_events_public.app_levels FROM authenticated;



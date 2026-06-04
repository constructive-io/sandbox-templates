-- Revert: schemas/myapp_events_public/tables/app_level_requirements/grants/authenticated/insert/grant


REVOKE INSERT ON myapp_events_public.app_level_requirements FROM authenticated;



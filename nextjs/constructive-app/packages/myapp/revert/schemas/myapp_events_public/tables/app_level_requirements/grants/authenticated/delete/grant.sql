-- Revert: schemas/myapp_events_public/tables/app_level_requirements/grants/authenticated/delete/grant


REVOKE DELETE ON myapp_events_public.app_level_requirements FROM authenticated;



-- Revert: schemas/myapp_events_public/tables/app_level_requirements/grants/authenticated/select/grant


REVOKE SELECT ON myapp_events_public.app_level_requirements FROM authenticated;



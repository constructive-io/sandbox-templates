-- Revert: schemas/myapp_events_public/tables/org_level_requirements/grants/authenticated/insert/grant


REVOKE INSERT ON myapp_events_public.org_level_requirements FROM authenticated;



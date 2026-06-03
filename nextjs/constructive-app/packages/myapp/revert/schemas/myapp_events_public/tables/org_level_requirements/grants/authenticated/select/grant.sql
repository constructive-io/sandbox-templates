-- Revert: schemas/myapp_events_public/tables/org_level_requirements/grants/authenticated/select/grant


REVOKE SELECT ON myapp_events_public.org_level_requirements FROM authenticated;



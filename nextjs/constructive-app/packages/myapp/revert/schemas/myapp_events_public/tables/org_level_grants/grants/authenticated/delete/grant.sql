-- Revert: schemas/myapp_events_public/tables/org_level_grants/grants/authenticated/delete/grant


REVOKE DELETE ON myapp_events_public.org_level_grants FROM authenticated;



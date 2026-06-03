-- Revert: schemas/myapp_events_public/tables/org_events/grants/authenticated/insert/grant


REVOKE INSERT ON myapp_events_public.org_events FROM authenticated;



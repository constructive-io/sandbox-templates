-- Revert: schemas/myapp_events_public/tables/org_events/grants/authenticated/update/grant


REVOKE UPDATE ON myapp_events_public.org_events FROM authenticated;


